/**
 * Billing Module API Service Layer
 * Database operations for billing, payments, and discharge
 */

import { db, type DbTransaction } from "@/db"
import { services, billings, billingItems, payments, dischargeSummaries } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { prescriptions, drugs } from "@/db/schema/pharmacy"
import { materialUsage, rooms, bedAssignments } from "@/db/schema/inpatient"
import { medicalRecords, procedures } from "@/db/schema/medical-records"
import { eq, sql, and, desc, or, inArray } from "drizzle-orm"
import type {
  ServiceInput,
  ServiceUpdateInput,
  CreateBillingInput,
  PaymentInput,
  DischargeSummaryInput,
  BillingWithDetails,
} from "@/types/billing"
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateDiscountFromPercentage,
  calculateTotalAmount,
  calculatePatientPayable,
  calculateRemainingAmount,
  determinePaymentStatus,
  calculateChange,
} from "./billing-utils"
import { ProcessPaymentInput } from "./validation"

/**
 * Billing Totals Type
 */
type BillingTotals = {
  subtotal: number
  discount: number
  insuranceCoverage: number
  totalAmount: number
  patientPayable: number
  paidAmount: number
  remainingAmount: number
}

/**
 * Billing Item Type
 */
export type BillingItem = {
  itemType: string
  itemId: string | null
  itemName: string
  itemCode: string | null
  quantity: number
  unitPrice: string
  subtotal: string
  discount: string
  totalPrice: string
  description?: string
}

/**
 * Get all services (master data)
 */
export async function getAllServices() {
  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.category, services.name)

  return allServices
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string) {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1)

  return service || null
}

/**
 * Create new service
 */
export async function createService(data: ServiceInput) {
  const [newService] = await db
    .insert(services)
    .values({
      code: data.code,
      name: data.name,
      serviceType: data.serviceType,
      price: data.price,
      description: data.description || null,
      category: data.category || null,
    })
    .returning()

  return newService
}

/**
 * Update service
 */
export async function updateService(serviceId: string, data: Partial<ServiceUpdateInput>) {
  const [updatedService] = await db
    .update(services)
    .set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(services.id, serviceId))
    .returning()

  if (!updatedService) {
    throw new Error("Service not found")
  }

  return updatedService
}

/**
 * Get billing by visit ID
 */
export async function getBillingByVisitId(visitId: string): Promise<BillingWithDetails | null> {
  const [billing] = await db.select().from(billings).where(eq(billings.visitId, visitId)).limit(1)

  if (!billing) return null

  // Get billing items
  const items = await db
    .select()
    .from(billingItems)
    .where(eq(billingItems.billingId, billing.id))
    .orderBy(billingItems.createdAt)

  // Get payments
  const paymentsList = await db
    .select()
    .from(payments)
    .where(eq(payments.billingId, billing.id))
    .orderBy(desc(payments.receivedAt))

  // Get visit and patient info
  const [visitInfo] = await db
    .select({
      visit: visits,
      patient: patients,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .where(eq(visits.id, visitId))
    .limit(1)

  return {
    ...billing,
    items,
    payments: paymentsList,
    visit: visitInfo
      ? {
          id: visitInfo.visit.id,
          visitNumber: visitInfo.visit.visitNumber,
          visitType: visitInfo.visit.visitType,
        }
      : undefined,
    patient: visitInfo
      ? {
          id: visitInfo.patient.id,
          name: visitInfo.patient.name,
          mrNumber: visitInfo.patient.mrNumber,
        }
      : undefined,
  }
}

/**
 * Create billing with automatic aggregation from visit data
 * This is the BILLING ENGINE - aggregates all charges
 */
export async function createBillingForVisit(data: CreateBillingInput) {
  // Verify visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Check if billing already exists
  const existingBilling = await getBillingByVisitId(data.visitId)
  if (existingBilling) {
    throw new Error("Billing already exists for this visit")
  }

  // Aggregate all billing items
  const allItems = [...data.items]

  // 1. Add fulfilled prescriptions (drugs)
  const fulfilledPrescriptions = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .where(and(eq(prescriptions.medicalRecordId, visit.id), eq(prescriptions.isFulfilled, true)))

  fulfilledPrescriptions.forEach(({ prescription, drug }) => {
    const quantity = prescription.dispensedQuantity || prescription.quantity
    allItems.push({
      itemType: "drug",
      itemId: drug.id,
      itemName: drug.name,
      itemCode: drug.genericName || undefined,
      quantity,
      unitPrice: drug.price,
      discount: "0",
      description: `${prescription.dosage} - ${prescription.frequency}`,
    })
  })

  // 2. Add material usage (for inpatient)
  if (visit.visitType === "inpatient") {
    const materials = await db
      .select()
      .from(materialUsage)
      .where(eq(materialUsage.visitId, visit.id))

    materials.forEach((material) => {
      allItems.push({
        itemType: "material",
        itemId: null,
        itemName: material.materialName,
        quantity: material.quantity,
        unitPrice: material.unitPrice,
        discount: "0",
        description: material.notes || undefined,
      })
    })

    // 3. Add room charges (for inpatient)
    const bedAssignment = await db
      .select({
        assignment: bedAssignments,
        room: rooms,
      })
      .from(bedAssignments)
      .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
      .where(and(eq(bedAssignments.visitId, visit.id), eq(bedAssignments.discharged, false)))
      .limit(1)

    if (bedAssignment.length > 0) {
      const { assignment, room } = bedAssignment[0]

      // Calculate days stayed
      const admissionDate = new Date(assignment.assignedAt)
      const today = new Date()
      const daysStayed = Math.ceil(
        (today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      allItems.push({
        itemType: "room",
        itemId: room.id,
        itemName: `Kamar ${room.roomNumber} - ${room.roomType}`,
        itemCode: room.roomNumber,
        quantity: daysStayed,
        unitPrice: room.dailyRate,
        discount: "0",
        description: `Rawat inap ${daysStayed} hari`,
      })
    }
  }

  // Calculate billing amounts
  const itemsWithTotals = allItems.map((item) => ({
    ...item,
    subtotal: calculateItemTotal(item.quantity, item.unitPrice, "0"),
    totalPrice: calculateItemTotal(item.quantity, item.unitPrice, item.discount || "0"),
  }))

  const subtotal = calculateSubtotal(itemsWithTotals)

  // Apply discount
  let discount = data.discount || "0"
  if (data.discountPercentage) {
    discount = calculateDiscountFromPercentage(subtotal, data.discountPercentage)
  }

  const tax = "0" // No tax for now
  const totalAmount = calculateTotalAmount(subtotal, discount, tax)
  const insuranceCoverage = data.insuranceCoverage || "0"
  const patientPayable = calculatePatientPayable(totalAmount, insuranceCoverage)

  // Create billing record
  const [newBilling] = await db
    .insert(billings)
    .values({
      visitId: data.visitId,
      subtotal,
      discount,
      discountPercentage: data.discountPercentage || null,
      tax,
      totalAmount,
      insuranceCoverage,
      patientPayable,
      paymentStatus: "pending",
      paidAmount: "0",
      remainingAmount: patientPayable,
      notes: data.notes || null,
    })
    .returning()

  // Insert billing items
  await db.insert(billingItems).values(
    itemsWithTotals.map((item) => ({
      billingId: newBilling.id,
      itemType: item.itemType,
      itemId: item.itemId || null,
      itemName: item.itemName,
      itemCode: item.itemCode || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      discount: item.discount || "0",
      totalPrice: item.totalPrice,
      description: item.description || null,
    }))
  )

  return getBillingByVisitId(data.visitId)
}

/**
 * Process payment (legacy - kept for backward compatibility)
 */
export async function processPayment(data: PaymentInput) {
  // Get billing
  const [billing] = await db.select().from(billings).where(eq(billings.id, data.billingId)).limit(1)

  if (!billing) {
    throw new Error("Billing not found")
  }

  // Validate payment amount
  const paymentAmount = parseFloat(data.amount)
  const remainingAmount = parseFloat(billing.remainingAmount || billing.patientPayable)

  if (paymentAmount <= 0) {
    throw new Error("Payment amount must be greater than 0")
  }

  if (paymentAmount > remainingAmount) {
    throw new Error("Payment amount exceeds remaining balance")
  }

  // Calculate change for cash payments
  let changeGiven = null
  if (data.paymentMethod === "cash" && data.amountReceived) {
    changeGiven = calculateChange(data.amountReceived, data.amount)
  }

  // Insert payment record
  const [newPayment] = await db
    .insert(payments)
    .values({
      billingId: data.billingId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference || null,
      amountReceived: data.amountReceived || null,
      changeGiven,
      receivedBy: data.receivedBy,
      notes: data.notes || null,
    })
    .returning()

  // Update billing record
  const newPaidAmount = parseFloat(billing.paidAmount) + paymentAmount
  const newRemainingAmount = calculateRemainingAmount(
    billing.patientPayable,
    newPaidAmount.toString()
  )
  const newPaymentStatus = determinePaymentStatus(billing.patientPayable, newPaidAmount.toString())

  await db
    .update(billings)
    .set({
      paidAmount: newPaidAmount.toFixed(2),
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference || null,
      processedBy: data.receivedBy,
      processedAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(billings.id, data.billingId))

  return newPayment
}

/**
 * Process payment with discount (merged workflow)
 *
 * Handles discount application and payment processing in a single atomic transaction
 *
 * @param data - Payment and discount data
 * @returns Payment record with change information
 *
 * Features:
 * - Optional discount (nominal or percentage)
 * - Optional insurance coverage
 * - Recalculates billing totals if discount or insurance applied
 * - Validates payment amount against final total
 * - Calculates change for cash payments
 * - All operations in single database transaction
 *
 * Business Rules:
 * - Only one of discount or discountPercentage should be provided
 * - Payment amount must not exceed remaining balance
 * - For cash payments, amountReceived must be >= amount
 */
export async function processPaymentWithDiscount(data: ProcessPaymentInput) {
  return await db.transaction(async (tx) => {
    // 1. Get current billing record
    const [billing] = await tx
      .select()
      .from(billings)
      .where(eq(billings.id, data.billingId))
      .limit(1)

    if (!billing) {
      throw new Error("Billing tidak ditemukan")
    }

    let updatedBilling = billing
    let discountApplied = false

    // 2. Apply discount and/or insurance if provided
    if (data.discount || data.discountPercentage || data.insuranceCoverage) {
      let discountAmount = "0"

      if (data.discountPercentage) {
        // Calculate discount from percentage
        discountAmount = calculateDiscountFromPercentage(billing.subtotal, data.discountPercentage)
      } else if (data.discount) {
        discountAmount = data.discount
      }

      // Recalculate totals
      const tax = billing.tax || "0"
      const totalAmount = calculateTotalAmount(billing.subtotal, discountAmount, tax)
      const insuranceCoverage = data.insuranceCoverage || billing.insuranceCoverage || "0"
      const patientPayable = calculatePatientPayable(totalAmount, insuranceCoverage)
      const paidAmount = billing.paidAmount || "0"
      const remainingAmount = calculateRemainingAmount(patientPayable, paidAmount)

      // Update billing with new discount/insurance and totals
      const [updated] = await tx
        .update(billings)
        .set({
          discount: discountAmount,
          discountPercentage: data.discountPercentage || null,
          insuranceCoverage,
          totalAmount,
          patientPayable,
          remainingAmount,
        })
        .where(eq(billings.id, data.billingId))
        .returning()

      updatedBilling = updated
      discountApplied = true
    }

    // 3. Validate payment amount
    const paymentAmount = parseFloat(data.amount)
    const remainingAmount = parseFloat(
      updatedBilling.remainingAmount || updatedBilling.patientPayable
    )

    if (paymentAmount <= 0) {
      throw new Error("Jumlah pembayaran harus lebih besar dari 0")
    }

    if (paymentAmount > remainingAmount) {
      throw new Error(
        `Jumlah pembayaran (Rp ${paymentAmount.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${remainingAmount.toLocaleString("id-ID")})`
      )
    }

    // 4. Calculate change for cash payments
    let changeGiven: string | null = null
    if (data.paymentMethod === "cash" && data.amountReceived) {
      changeGiven = calculateChange(data.amountReceived, data.amount)
    }

    // 5. Insert payment record
    const [newPayment] = await tx
      .insert(payments)
      .values({
        billingId: data.billingId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        amountReceived: data.amountReceived || null,
        changeGiven,
        receivedBy: data.receivedBy,
        notes: data.notes || null,
      })
      .returning()

    // 6. Update billing with payment info
    const newPaidAmount = parseFloat(updatedBilling.paidAmount) + paymentAmount
    const newRemainingAmount = calculateRemainingAmount(
      updatedBilling.patientPayable,
      newPaidAmount.toString()
    )
    const newPaymentStatus = determinePaymentStatus(
      updatedBilling.patientPayable,
      newPaidAmount.toString()
    )

    await tx
      .update(billings)
      .set({
        paidAmount: newPaidAmount.toFixed(2),
        remainingAmount: newRemainingAmount,
        paymentStatus: newPaymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        processedBy: data.receivedBy,
        processedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(billings.id, data.billingId))

    return {
      payment: newPayment,
      discountApplied,
      finalTotal: updatedBilling.patientPayable,
      paidAmount: newPaidAmount.toFixed(2),
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
      change: changeGiven,
    }
  })
}

/**
 * Get all pending billings
 */
export async function getPendingBillings() {
  const pendingBills = await db
    .select({
      billing: billings,
      visit: visits,
      patient: patients,
    })
    .from(billings)
    .innerJoin(visits, eq(billings.visitId, visits.id))
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .where(eq(billings.paymentStatus, "pending"))
    .orderBy(desc(billings.createdAt))

  return pendingBills
}

/**
 * Check if visit can be discharged (billing gate)
 */
export async function canDischarge(visitId: string): Promise<{
  canDischarge: boolean
  reason?: string
  billing?: any
}> {
  const billing = await getBillingByVisitId(visitId)

  if (!billing) {
    return {
      canDischarge: false,
      reason: "Billing belum dibuat. Harap buat billing terlebih dahulu.",
    }
  }

  if (billing.paymentStatus !== "paid") {
    return {
      canDischarge: false,
      reason: `Pembayaran belum lunas. Status: ${billing.paymentStatus}. Sisa: Rp ${parseFloat(
        billing.remainingAmount || "0"
      ).toLocaleString("id-ID")}`,
      billing,
    }
  }

  return {
    canDischarge: true,
    billing,
  }
}

/**
 * Create discharge summary
 */
export async function createDischargeSummary(data: DischargeSummaryInput) {
  // Check if visit can be discharged (billing gate)
  const dischargeCheck = await canDischarge(data.visitId)

  if (!dischargeCheck.canDischarge) {
    throw new Error(dischargeCheck.reason || "Cannot discharge patient")
  }

  // Check if discharge summary already exists
  const [existing] = await db
    .select()
    .from(dischargeSummaries)
    .where(eq(dischargeSummaries.visitId, data.visitId))
    .limit(1)

  if (existing) {
    throw new Error("Discharge summary already exists for this visit")
  }

  // Create discharge summary
  const [summary] = await db
    .insert(dischargeSummaries)
    .values({
      visitId: data.visitId,
      admissionDiagnosis: data.admissionDiagnosis,
      dischargeDiagnosis: data.dischargeDiagnosis,
      clinicalSummary: data.clinicalSummary,
      proceduresPerformed: data.proceduresPerformed || null,
      medicationsOnDischarge: data.medicationsOnDischarge || null,
      dischargeInstructions: data.dischargeInstructions,
      dietaryRestrictions: data.dietaryRestrictions || null,
      activityRestrictions: data.activityRestrictions || null,
      followUpDate: data.followUpDate || null,
      followUpInstructions: data.followUpInstructions || null,
      dischargedBy: data.dischargedBy,
    })
    .returning()

  // Update visit status to discharged
  await db
    .update(visits)
    .set({
      status: "completed",
      endAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(visits.id, data.visitId))

  // If inpatient, update bed assignment
  await db
    .update(bedAssignments)
    .set({
      discharged: true,
      dischargedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(and(eq(bedAssignments.visitId, data.visitId), eq(bedAssignments.discharged, false)))

  return summary
}

/**
 * Get discharge summary by visit ID
 */
export async function getDischargeSummary(visitId: string) {
  const [summary] = await db
    .select()
    .from(dischargeSummaries)
    .where(eq(dischargeSummaries.visitId, visitId))
    .limit(1)

  return summary || null
}

/**
 * Get billing statistics
 */
export async function getBillingStatistics() {
  // Get all billings
  const allBillings = await db.select().from(billings)

  const stats = {
    totalBillings: allBillings.length,
    pendingBillings: allBillings.filter((b) => b.paymentStatus === "pending").length,
    paidBillings: allBillings.filter((b) => b.paymentStatus === "paid").length,
    partialBillings: allBillings.filter((b) => b.paymentStatus === "partial").length,
    totalRevenue: allBillings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0).toFixed(2),
    pendingRevenue: allBillings
      .filter((b) => b.paymentStatus !== "paid")
      .reduce((sum, b) => sum + parseFloat(b.remainingAmount || "0"), 0)
      .toFixed(2),
  }

  // Get today's collections
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysPayments = await db
    .select()
    .from(payments)
    .where(sql`DATE(${payments.receivedAt}) = CURRENT_DATE`)

  const collectedToday = todaysPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)

  return {
    ...stats,
    collectedToday,
  }
}

/**
 * Get visits ready for billing (RME locked, not yet paid)
 *
 * Fetches visits that meet the billing criteria:
 * 1. Medical record is locked (RME completed and locked by doctor)
 * 2. Payment is NOT fully completed (pending, partial, or no billing exists)
 *
 * This is the BILLING QUEUE - shows visits waiting for payment processing
 *
 * @returns Array of visits with patient, billing, and medical record info
 *
 * Business Rules:
 * - Medical record MUST be locked before billing can be created
 * - Visits with no billing record are included (need billing creation)
 * - Visits with pending or partial payment are included
 * - Visits with fully paid status are excluded
 *
 * Performance optimizations:
 * - Uses LEFT JOIN for optional billing data
 * - Efficient WHERE clause with indexed columns
 * - Ordered by creation date (newest first)
 */
export async function getVisitsReadyForBilling() {
  const result = await db
    .select({
      visit: visits,
      patient: patients,
      billing: billings,
      medicalRecord: medicalRecords,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(medicalRecords, eq(visits.id, medicalRecords.visitId))
    .leftJoin(billings, eq(visits.id, billings.visitId))
    .where(
      and(
        // Medical record must be locked (RME completed)
        eq(medicalRecords.isLocked, true),
        // Payment must be incomplete (pending, partial, or no billing exists)
        or(eq(billings.paymentStatus, "pending"), eq(billings.paymentStatus, "partial"))
      )
    )
    .orderBy(desc(visits.createdAt))

  return result
}

/**
 * Get billing details with items, patient, and visit info
 *
 * Fetches comprehensive billing information including:
 * - Billing record with totals and payment status
 * - Billing items (services, procedures, medications)
 * - Payment history
 * - Patient and visit information
 *
 * @param visitId - The visit ID to get billing details for
 * @returns Billing details with all related data, or null if not found
 *
 * Performance optimizations:
 * - Parallel fetching of billing and visit data
 * - Early return if billing not found
 * - Efficient joins for related data
 */
export async function getBillingDetails(visitId: string) {
  // Fetch billing and visit info in parallel for better performance
  const [billingResult, visitResult] = await Promise.all([
    db.select().from(billings).where(eq(billings.visitId, visitId)).limit(1),
    db
      .select({
        visit: visits,
        patient: patients,
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .where(eq(visits.id, visitId))
      .limit(1),
  ])

  // Early return if billing or visit not found
  if (billingResult.length === 0 || visitResult.length === 0) {
    return null
  }

  const billing = billingResult[0]
  const { visit, patient } = visitResult[0]

  // Fetch billing items and payments in parallel
  const [items, paymentHistory] = await Promise.all([
    db
      .select()
      .from(billingItems)
      .where(eq(billingItems.billingId, billing.id))
      .orderBy(billingItems.id),
    db
      .select()
      .from(payments)
      .where(eq(payments.billingId, billing.id))
      .orderBy(desc(payments.createdAt)),
  ])

  return {
    billing,
    items,
    payments: paymentHistory,
    patient: {
      name: patient.name,
      mrNumber: patient.mrNumber,
    },
    visit: {
      visitNumber: visit.visitNumber,
      createdAt: visit.createdAt,
    },
  }
}

/**
 * Create or update billing record for a visit
 */
export async function createOrUpdateBilling(
  visitId: string,
  userId: string,
  options?: {
    discount?: number
    discountPercentage?: number
    insuranceCoverage?: number
  }
) {
  // Calculate billing
  const calculation = await calculateBillingForVisit(visitId)
  const subtotal = parseFloat(calculation.subtotal)

  // Calculate discount
  let discount = options?.discount || 0
  if (options?.discountPercentage) {
    discount = subtotal * (options.discountPercentage / 100)
  }

  const insuranceCoverage = options?.insuranceCoverage || 0
  const totalAmount = subtotal - discount
  const patientPayable = totalAmount - insuranceCoverage

  // Check if billing exists
  const existingBilling = await db.query.billings.findFirst({
    where: eq(billings.visitId, visitId),
  })

  let billingId: string

  if (existingBilling) {
    // Update existing billing
    await db
      .update(billings)
      .set({
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        discountPercentage: options?.discountPercentage?.toFixed(2) || null,
        insuranceCoverage: insuranceCoverage.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        patientPayable: patientPayable.toFixed(2),
        remainingAmount: (patientPayable - parseFloat(existingBilling.paidAmount)).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(billings.id, existingBilling.id))

    billingId = existingBilling.id
  } else {
    // Create new billing
    const [newBilling] = await db
      .insert(billings)
      .values({
        visitId,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        discountPercentage: options?.discountPercentage?.toFixed(2) || null,
        tax: "0.00",
        insuranceCoverage: insuranceCoverage.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        patientPayable: patientPayable.toFixed(2),
        paidAmount: "0.00",
        remainingAmount: patientPayable.toFixed(2),
        paymentStatus: "pending",
      })
      .returning()

    billingId = newBilling.id
  }

  // Delete existing billing items
  await db.delete(billingItems).where(eq(billingItems.billingId, billingId))

  // Insert new billing items (only if there are items)
  if (calculation.items.length > 0) {
    await db.insert(billingItems).values(
      calculation.items.map((item) => ({
        billingId,
        ...item,
      }))
    )
  }

  return billingId
}

// /**
//  * Process payment for a billing
//  */
// export async function processPayment(
//   billingId: string,
//   userId: string,
//   paymentData: {
//     amount: number
//     paymentMethod: string
//     paymentReference?: string
//     amountReceived?: number // For cash payments
//     notes?: string
//   }
// ) {
//   const billing = await db.query.billings.findFirst({
//     where: eq(billings.id, billingId),
//   })

//   if (!billing) {
//     throw new Error("Billing not found")
//   }

//   const patientPayable = parseFloat(billing.patientPayable)
//   const paidAmount = parseFloat(billing.paidAmount)
//   const remainingAmount = patientPayable - paidAmount

//   if (paymentData.amount > remainingAmount) {
//     throw new Error("Payment amount exceeds remaining balance")
//   }

//   // Calculate change for cash payments
//   let changeGiven = 0
//   if (paymentData.paymentMethod === "cash" && paymentData.amountReceived) {
//     changeGiven = paymentData.amountReceived - paymentData.amount
//     if (changeGiven < 0) {
//       throw new Error("Amount received is less than payment amount")
//     }
//   }

//   // Create payment record
//   await db.insert(payments).values({
//     billingId,
//     amount: paymentData.amount.toFixed(2),
//     paymentMethod: paymentData.paymentMethod,
//     paymentReference: paymentData.paymentReference || null,
//     amountReceived: paymentData.amountReceived?.toFixed(2) || null,
//     changeGiven: changeGiven > 0 ? changeGiven.toFixed(2) : null,
//     receivedBy: userId,
//     notes: paymentData.notes || null,
//   })

//   // Update billing
//   const newPaidAmount = paidAmount + paymentData.amount
//   const newRemainingAmount = patientPayable - newPaidAmount
//   const newPaymentStatus =
//     newRemainingAmount <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "pending"

//   await db
//     .update(billings)
//     .set({
//       paidAmount: newPaidAmount.toFixed(2),
//       remainingAmount: newRemainingAmount.toFixed(2),
//       paymentStatus: newPaymentStatus,
//       paymentMethod: paymentData.paymentMethod,
//       paymentReference: paymentData.paymentReference || null,
//       processedBy: userId,
//       processedAt: new Date(),
//       updatedAt: new Date(),
//     })
//     .where(eq(billings.id, billingId))

//   return {
//     success: true,
//     paymentStatus: newPaymentStatus,
//     paidAmount: newPaidAmount,
//     remainingAmount: newRemainingAmount,
//     changeGiven,
//   }
// }

/**
 * Helper: Create billing item for drug
 */
function createDrugBillingItem(
  drug: { id: string; name: string; price: string },
  quantity: number,
  description: string
): BillingItem {
  const unitPrice = parseFloat(drug.price)
  const itemSubtotal = quantity * unitPrice
  return {
    itemType: "drug",
    itemId: drug.id,
    itemName: drug.name,
    itemCode: null,
    quantity,
    unitPrice: drug.price,
    subtotal: itemSubtotal.toFixed(2),
    discount: "0.00",
    totalPrice: itemSubtotal.toFixed(2),
    description,
  }
}

/**
 * Helper: Create billing item from service
 */
function createServiceBillingItem(
  service: { id: string; name: string; code: string | null; price: string },
  description: string
): BillingItem {
  const price = parseFloat(service.price)
  return {
    itemType: "service",
    itemId: service.id,
    itemName: service.name,
    itemCode: service.code,
    quantity: 1,
    unitPrice: service.price,
    subtotal: price.toFixed(2),
    discount: "0.00",
    totalPrice: price.toFixed(2),
    description,
  }
}

/**
 * Calculate total billing for a visit
 * Aggregates costs from: admin fee, consultation, procedures, medications
 */
export async function calculateBillingForVisit(visitId: string) {
  // Validate visit exists
  const visitResult = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)
  if (visitResult.length === 0) {
    throw new Error("Visit not found")
  }

  const items: BillingItem[] = []
  let subtotal = 0

  // Helper to add item and update subtotal
  const addBillingItem = (item: BillingItem) => {
    items.push(item)
    subtotal += parseFloat(item.totalPrice)
  }

  // 1. Add Administration Fee
  const adminService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "administration"), eq(services.isActive, true)))
    .limit(1)

  if (adminService.length > 0) {
    addBillingItem(createServiceBillingItem(adminService[0], "Biaya administrasi pendaftaran"))
  }

  // 2. Add Doctor Consultation Fee
  const consultationService = await db
    .select()
    .from(services)
    .where(and(eq(services.serviceType, "consultation"), eq(services.isActive, true)))
    .limit(1)

  if (consultationService.length > 0) {
    addBillingItem(createServiceBillingItem(consultationService[0], "Biaya konsultasi dokter"))
  }

  // 3. Add Medical Procedures - Fixed N+1 query problem
  const proceduresList = await db
    .select({ procedure: procedures })
    .from(procedures)
    .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
    .where(eq(medicalRecords.visitId, visitId))

  if (proceduresList.length > 0) {
    // Collect unique ICD-9 codes
    const icd9Codes = [...new Set(proceduresList.map((p) => p.procedure.icd9Code))]

    // Fetch all procedure services in ONE query
    const procedureServices = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.serviceType, "procedure"),
          inArray(services.code, icd9Codes),
          eq(services.isActive, true)
        )
      )

    // Create a Map for O(1) lookup
    const servicesByCode = new Map(procedureServices.map((s) => [s.code, s]))

    // Add billing items for procedures
    for (const { procedure } of proceduresList) {
      const service = servicesByCode.get(procedure.icd9Code)
      if (service) {
        addBillingItem(createServiceBillingItem(service, procedure.description || ""))
      }
    }
  }

  // 4. Add Medications (all prescribed medications, regardless of fulfillment status)
  const prescriptionsList = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
    })
    .from(prescriptions)
    .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
    .where(eq(medicalRecords.visitId, visitId))

  for (const { prescription, drug } of prescriptionsList) {
    // Use prescribed quantity for billing (not dispensed quantity)
    // Billing reflects what doctor prescribed, fulfillment is separate
    const quantity = prescription.quantity
    const description = `${prescription.dosage}, ${prescription.frequency}`
    addBillingItem(createDrugBillingItem(drug, quantity, description))
  }

  return {
    visitId,
    items,
    subtotal: subtotal.toFixed(2),
    totalAmount: subtotal.toFixed(2),
  }
}

/**
 * Create billing record from medical record
 * Simple function to create initial billing when medical record is locked
 * @param visitId - The visit ID
 * @param tx - Optional transaction object for atomic operations
 */
export async function createBillingFromMedicalRecord(
  visitId: string,
  tx?: DbTransaction
): Promise<string> {
  const dbInstance = tx || db

  // Calculate billing items and totals
  const calculation = await calculateBillingForVisit(visitId)
  const subtotal = parseFloat(calculation.subtotal)

  // Create billing record
  const [billing] = await dbInstance
    .insert(billings)
    .values({
      visitId,
      subtotal: subtotal.toFixed(2),
      discount: "0.00",
      discountPercentage: null,
      tax: "0.00",
      insuranceCoverage: "0.00",
      totalAmount: subtotal.toFixed(2),
      patientPayable: subtotal.toFixed(2),
      paidAmount: "0.00",
      remainingAmount: subtotal.toFixed(2),
      paymentStatus: "pending",
    })
    .returning()

  // Insert billing items
  if (calculation.items.length > 0) {
    await dbInstance.insert(billingItems).values(
      calculation.items.map((item) => ({
        billingId: billing.id,
        ...item,
      }))
    )
  }

  return billing.id
}

/**
 * Helper: Calculate subtotal from billing items
 */
function calculateSubtotalFromItems(items: Array<{ totalPrice: string }>): number {
  return items.reduce((total, item) => total + parseFloat(item.totalPrice), 0)
}

/**
 * Helper: Calculate billing totals
 */
function calculateBillingTotals(
  subtotal: number,
  discount: number,
  insuranceCoverage: number,
  paidAmount: number
): BillingTotals {
  const totalAmount = subtotal - discount
  const patientPayable = totalAmount - insuranceCoverage
  const remainingAmount = patientPayable - paidAmount

  return {
    subtotal,
    discount,
    insuranceCoverage,
    totalAmount,
    patientPayable,
    paidAmount,
    remainingAmount,
  }
}

/**
 * Recalculate and update existing billing record
 * Used when billing items change (e.g., doctor adds adjustment)
 * @param visitId - The visit ID
 * @param tx - Optional transaction object for atomic operations
 */
export async function recalculateBilling(visitId: string, tx?: DbTransaction): Promise<void> {
  const dbInstance = tx || db

  // Get existing billing
  const existingBilling = await dbInstance.query.billings.findFirst({
    where: eq(billings.visitId, visitId),
  })

  if (!existingBilling) {
    throw new Error("Billing not found for this visit")
  }

  // Get all current billing items
  const items = await dbInstance
    .select()
    .from(billingItems)
    .where(eq(billingItems.billingId, existingBilling.id))

  // Calculate new subtotal from all billing items
  const subtotal = calculateSubtotalFromItems(items)

  // Calculate all billing totals
  const totals = calculateBillingTotals(
    subtotal,
    parseFloat(existingBilling.discount),
    parseFloat(existingBilling.insuranceCoverage || "0"),
    parseFloat(existingBilling.paidAmount)
  )

  // Update billing record with new totals
  await dbInstance
    .update(billings)
    .set({
      subtotal: totals.subtotal.toFixed(2),
      totalAmount: totals.totalAmount.toFixed(2),
      patientPayable: totals.patientPayable.toFixed(2),
      remainingAmount: totals.remainingAmount.toFixed(2),
    })
    .where(eq(billings.id, existingBilling.id))
}
