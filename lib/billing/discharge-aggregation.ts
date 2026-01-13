/**
 * Discharge Billing Aggregation Utility
 * Collects and aggregates all billable items for inpatient discharge
 *
 * This module handles:
 * - Room/bed charges (calculated by days stayed)
 * - Material usage from nursing care
 * - Medications dispensed (fulfilled prescriptions)
 * - Procedures performed
 * - Laboratory tests performed
 * - Consultation/service charges
 */

import { db } from "@/db"
import { eq, and } from "drizzle-orm"
import { bedAssignments, rooms, materialUsage } from "@/db/schema/inpatient"
import { prescriptions, inventoryItems } from "@/db/schema/inventory"
import { procedures } from "@/db/schema/medical-records"
import { services } from "@/db/schema/billing"
import { labOrders, labTests } from "@/db/schema/laboratory"
import type {
  BillingItemInput,
  DischargeBillingBreakdown,
  DischargeBillingSummary,
} from "@/types/billing"
import { visits } from "@/db/schema"

export interface Breakdown {
  roomCharges?: string
  materialCharges?: string
  medicationCharges: string
  procedureCharges: string
  laboratoryCharges: string
  serviceCharges: string
}

export interface Counts {
  roomCount?: number
  materialCount?: number
  medicationCount: number
  procedureCount: number
  laboratoryCount: number
  serviceCount: number
}

/**
 * Aggregated discharge billing summary
 */
export interface DischargeBillingAggregate {
  visitId: string
  visitType: string
  items: BillingItemInput[]
  breakdown: Breakdown
  counts: Counts
  subtotal: string
  itemCount: number
}

/**
 * Calculate room charges based on bed assignment duration
 * Uses daily rate × number of days stayed (rounded up)
 * Aggregates ALL bed assignments (includes room transfers)
 */
async function aggregateRoomCharges(visitId: string): Promise<BillingItemInput[]> {
  // Get ALL bed assignments for this visit (not just one)
  const bedAssignmentList = await db
    .select({
      id: bedAssignments.id,
      assignedAt: bedAssignments.assignedAt,
      dischargedAt: bedAssignments.dischargedAt,
      bedNumber: bedAssignments.bedNumber,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      dailyRate: rooms.dailyRate,
    })
    .from(bedAssignments)
    .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
    .where(eq(bedAssignments.visitId, visitId))
    .orderBy(bedAssignments.assignedAt) // Order by assignment date

  if (bedAssignmentList.length === 0) {
    return []
  }

  // Create billing items for each bed assignment (each room stay)
  return bedAssignmentList.map((assignment) => {
    const startDate = new Date(assignment.assignedAt)
    const endDate = assignment.dischargedAt ? new Date(assignment.dischargedAt) : new Date()

    // Calculate days stayed (minimum 1 day, rounded up)
    const millisecondsDiff = endDate.getTime() - startDate.getTime()
    const daysDiff = Math.ceil(millisecondsDiff / (1000 * 60 * 60 * 24))
    const daysStayed = Math.max(1, daysDiff)

    const dailyRate = parseFloat(assignment.dailyRate)
    const totalRoomCharge = (dailyRate * daysStayed).toFixed(2)

    return {
      itemType: "room" as const,
      itemName: `Kamar ${assignment.roomType} - ${assignment.roomNumber} (Bed ${assignment.bedNumber})`,
      itemCode: assignment.roomNumber,
      quantity: daysStayed,
      unitPrice: assignment.dailyRate,
      discount: "0",
      totalPrice: totalRoomCharge,
      description: `Biaya rawat inap ${daysStayed} hari`,
    }
  })
}

/**
 * Aggregate material usage charges
 * Collects all materials used during the visit
 */
async function aggregateMaterialCharges(visitId: string): Promise<BillingItemInput[]> {
  const materials = await db
    .select({
      id: materialUsage.id,
      materialName: materialUsage.materialName,
      quantity: materialUsage.quantity,
      unit: materialUsage.unit,
      unitPrice: materialUsage.unitPrice,
      totalPrice: materialUsage.totalPrice,
      notes: materialUsage.notes,
    })
    .from(materialUsage)
    .where(eq(materialUsage.visitId, visitId))

  return materials.map((material) => ({
    itemType: "material" as const,
    itemId: material.id, // Will be converted to string in billing
    itemName: `${material.materialName || "Material"}`,
    quantity: parseFloat(material.quantity.toString()),
    unitPrice: material.unitPrice || "0",
    discount: "0",
    totalPrice: material.totalPrice,
    description: material.notes || `${material.quantity} ${material.unit || "unit"}`,
  }))
}

/**
 * Aggregate medication charges from fulfilled prescriptions
 * Only includes prescriptions that have been dispensed by pharmacy
 */
async function aggregateMedicationCharges(
  visitId: string,
  visitType: string
): Promise<BillingItemInput[]> {
  const conditions = [eq(prescriptions.visitId, visitId)]

  if (visitType === "inpatient") {
    conditions.push(eq(prescriptions.isFulfilled, true)) // Only fulfilled prescriptions
  }

  const medications = await db
    .select({
      id: prescriptions.id,
      drugName: inventoryItems.name,
      dosage: prescriptions.dosage,
      frequency: prescriptions.frequency,
      quantity: prescriptions.quantity,
      dispensedQuantity: prescriptions.dispensedQuantity,
      drugPrice: inventoryItems.price,
    })
    .from(prescriptions)
    .innerJoin(inventoryItems, eq(prescriptions.drugId, inventoryItems.id))
    .where(and(...conditions))

  return medications.map((med) => {
    const quantityDispensed = med.dispensedQuantity || med.quantity
    const unitPrice = parseFloat(med.drugPrice)
    const totalPrice = (unitPrice * quantityDispensed).toFixed(2)

    return {
      itemType: "drug" as const,
      itemId: med.id,
      itemName: med.drugName,
      quantity: quantityDispensed,
      unitPrice: med.drugPrice,
      discount: "0",
      totalPrice,
      description: `${med.dosage || ""} - ${med.frequency}`.trim(),
    }
  })
}

/**
 * Aggregate procedure charges
 * Only includes completed procedures
 */
async function aggregateProcedureCharges(
  visitId: string,
  visitType: string
): Promise<BillingItemInput[]> {
  const conditions = [eq(procedures.visitId, visitId)]

  if (visitType === "inpatient") {
    conditions.push(eq(procedures.status, "completed")) // Only completed procedures
  }

  const procedureList = await db
    .select({
      id: procedures.id,
      description: procedures.description,
      icd9Code: procedures.icd9Code,
      serviceId: procedures.serviceId,
      serviceName: services.name,
      serviceCode: services.code,
      servicePrice: services.price,
      performedAt: procedures.performedAt,
    })
    .from(procedures)
    .leftJoin(services, eq(procedures.serviceId, services.id))
    .where(and(...conditions))

  return procedureList.map((proc) => ({
    itemType: "service" as const,
    itemId: proc.serviceId || undefined,
    itemName: proc.serviceName || proc.description,
    itemCode: proc.icd9Code || proc.serviceCode || undefined,
    quantity: 1,
    unitPrice: proc.servicePrice || "0",
    discount: "0",
    totalPrice: proc.servicePrice || "0",
    description: proc.description,
  }))
}

/**
 * Aggregate laboratory test charges
 * Includes all verified lab orders for this visit
 */
async function aggregateLabOrderCharges(visitId: string): Promise<BillingItemInput[]> {
  const labOrderList = await db
    .select({
      id: labOrders.id,
      orderNumber: labOrders.orderNumber,
      price: labOrders.price,
      testName: labTests.name,
      testCode: labTests.code,
      orderedAt: labOrders.orderedAt,
      status: labOrders.status,
    })
    .from(labOrders)
    .leftJoin(labTests, eq(labOrders.testId, labTests.id))
    .where(
      and(
        eq(labOrders.visitId, visitId),
        eq(labOrders.status, "verified") // Only verified/completed lab orders
      )
    )

  return labOrderList.map((order) => {
    const price = parseFloat(order.price)
    return {
      itemType: "laboratory" as const,
      itemId: order.id,
      itemName: order.testName || "Lab Test",
      itemCode: order.testCode || undefined,
      quantity: 1,
      unitPrice: order.price,
      discount: "0",
      totalPrice: price.toFixed(2),
      description: order.orderNumber || undefined,
    }
  })
}

/**
 * Aggregate service charges (administration, consultation)
 * Includes standard fees that apply to inpatient visits
 */
async function aggregateServiceCharges(): Promise<BillingItemInput[]> {
  const serviceItems: BillingItemInput[] = []

  // 1. Add Administration Fee
  const adminService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "administration"), eq(services.isActive, true)))
    .limit(1)

  if (adminService.length > 0) {
    const service = adminService[0]
    const price = parseFloat(service.price)
    serviceItems.push({
      itemType: "service" as const,
      itemId: service.id,
      itemName: service.name,
      itemCode: service.code || undefined,
      quantity: 1,
      unitPrice: service.price,
      discount: "0",
      totalPrice: price.toFixed(2),
      description: "Biaya administrasi pendaftaran rawat inap",
    })
  }

  // 2. Add Doctor Consultation Fee
  const consultationService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "consultation"), eq(services.isActive, true)))
    .limit(1)

  if (consultationService.length > 0) {
    const service = consultationService[0]
    const price = parseFloat(service.price)
    serviceItems.push({
      itemType: "service" as const,
      itemId: service.id,
      itemName: service.name,
      itemCode: service.code || undefined,
      quantity: 1,
      unitPrice: service.price,
      discount: "0",
      totalPrice: price.toFixed(2),
      description: "Biaya konsultasi dokter rawat inap",
    })
  }

  return serviceItems
}

/**
 * Main aggregation function
 * Collects all billable items for an inpatient visit
 */
export async function aggregateDischargebilling(
  visitId: string
): Promise<DischargeBillingAggregate> {
  // Verify this is an inpatient visit
  const [visit] = await db
    .select({
      id: visits.id,
      visitType: visits.visitType,
    })
    .from(visits)
    .where(eq(visits.id, visitId))
    .limit(1)

  if (!visit) {
    throw new Error(`Visit not found: ${visitId}`)
  }

  // Calculate breakdown totals
  const calculateTotal = (items: BillingItemInput[]) =>
    items.reduce((sum, item) => sum + parseFloat(item.totalPrice || "0"), 0).toFixed(2)

  const aggregatesData = [
    aggregateMedicationCharges(visitId, visit.visitType),
    aggregateProcedureCharges(visitId, visit.visitType),
    aggregateLabOrderCharges(visitId),
    aggregateServiceCharges(),
  ]

  if (visit.visitType === "inpatient") {
    aggregatesData.push(aggregateRoomCharges(visitId))
    aggregatesData.push(aggregateMaterialCharges(visitId))
  }

  // Aggregate all charges in parallel for performance
  const [medicationItems, procedureItems, labOrderItems, serviceItems] =
    await Promise.all(aggregatesData)

  // Combine all items
  let allItems = [...medicationItems, ...procedureItems, ...labOrderItems, ...serviceItems]

  let breakdown: Breakdown = {
    medicationCharges: calculateTotal(medicationItems),
    procedureCharges: calculateTotal(procedureItems),
    laboratoryCharges: calculateTotal(labOrderItems),
    serviceCharges: calculateTotal(serviceItems),
  }

  let counts: Counts = {
    medicationCount: medicationItems.length,
    procedureCount: procedureItems.length,
    laboratoryCount: labOrderItems.length,
    serviceCount: serviceItems.length,
  }

  if (visit.visitType === "inpatient") {
    const roomItems = await aggregateRoomCharges(visitId)
    const materialItems = await aggregateMaterialCharges(visitId)

    allItems = [...allItems, ...roomItems, ...materialItems]
    breakdown = {
      ...breakdown,
      roomCharges: calculateTotal(roomItems),
      materialCharges: calculateTotal(materialItems),
    }

    counts = {
      ...counts,
      roomCount: roomItems.length,
      materialCount: materialItems.length,
    }
  }

  const subtotal = calculateTotal(allItems)

  return {
    visitId,
    visitType: visit.visitType,
    items: allItems,
    breakdown,
    counts,
    subtotal,
    itemCount: allItems.length,
  }
}

/**
 * Get billing breakdown summary for display
 * Returns formatted breakdown for UI display
 */
export async function getDischargeBillingSummary(
  visitId: string
): Promise<DischargeBillingSummary> {
  const aggregate = await aggregateDischargebilling(visitId)

  let breakdown: Partial<DischargeBillingBreakdown> = {}

  if (aggregate.visitType === "inpatient") {
    breakdown = {
      ...breakdown,
      roomCharges: {
        label: "Biaya Kamar & Rawat Inap",
        amount: aggregate.breakdown.roomCharges,
        count: aggregate.counts.roomCount,
      },
      materialCharges: {
        label: "Alat Kesehatan & Material",
        amount: aggregate.breakdown.materialCharges,
        count: aggregate.counts.materialCount,
      },
    }
  }

  breakdown = {
    ...breakdown,
    medicationCharges: {
      label: "Obat-obatan",
      amount: aggregate.breakdown.medicationCharges,
      count: aggregate.counts.medicationCount,
    },
    procedureCharges: {
      label: "Tindakan Medis",
      amount: aggregate.breakdown.procedureCharges,
      count: aggregate.counts.procedureCount,
    },
    laboratoryCharges: {
      label: "Pemeriksaan Laboratorium",
      amount: aggregate.breakdown.laboratoryCharges,
      count: aggregate.counts.laboratoryCount,
    },
    serviceCharges: {
      label: "Administrasi & Konsultasi",
      amount: aggregate.breakdown.serviceCharges,
      count: aggregate.counts.serviceCount,
    },
  }

  return {
    breakdown: breakdown as DischargeBillingBreakdown,
    visitId: aggregate.visitId,
    subtotal: aggregate.subtotal,
    totalItems: aggregate.itemCount,
  }
}
