/**
 * Inpatient API Service Layer
 * Handles database operations for Inpatient module
 */

import { eq, and, isNull, desc, or, gte, lte, inArray, ilike, sql, SQL } from "drizzle-orm"
import { alias as aliasedTable, PgUpdateSetSource } from "drizzle-orm/pg-core"

import { db } from "@/db"
import { rooms, bedAssignments, vitalsHistory, materialUsage } from "@/db/schema/inpatient"
import { medicalRecords, procedures } from "@/db/schema/medical-records"
import { prescriptions, drugs } from "@/db/schema/inventory"
import { services, dischargeSummaries } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { PROCEDURE_STATUS, type InpatientFilters, type VitalSigns } from "@/types/inpatient"
import { getSession } from "@/lib/rbac"
import {
  getMaterialById,
  findAvailableBatch,
  validateBatch,
  deductStock,
  createStockMovement,
  checkStockAvailability,
} from "@/lib/inventory/api-service"

import { calculateBMI } from "./vitals-utils"
import type {
  RoomInput,
  BedAssignmentInput,
  VitalSignsInput,
  CPPTInput,
  MaterialUsageInput,
  RoomUpdateInput,
  InpatientPrescriptionInput,
  InpatientProcedureInput,
  AdministerPrescriptionInput,
  UpdateProcedureStatusInput,
} from "./validation"

// Create aliases for user table to avoid conflicts in multi-join queries
const administeredByUser = aliasedTable(user, "administeredByUser")
const fulfilledByUser = aliasedTable(user, "fulfilledByUser")
const orderedByUser = aliasedTable(user, "orderedByUser")
const performedByUser = aliasedTable(user, "performedByUser")

/**
 * Build WHERE conditions for inpatient list query
 */
export function buildInpatientWhereConditions(filters: InpatientFilters): SQL[] {
  const conditions: SQL[] = [
    eq(visits.visitType, "inpatient"),
    isNull(visits.dischargeDate),
    isNull(bedAssignments.dischargedAt),
  ]

  // Search filter (patient name, MR number, room number)
  if (filters.search) {
    conditions.push(
      or(
        ilike(patients.name, `%${filters.search}%`),
        ilike(patients.mrNumber, `%${filters.search}%`),
        ilike(rooms.roomNumber, `%${filters.search}%`)
      )!
    )
  }

  // Room type filter
  if (filters.roomType && filters.roomType !== "all") {
    conditions.push(eq(rooms.roomType, filters.roomType))
  }

  // Admission date range filters
  if (filters.admissionDateFrom) {
    conditions.push(gte(visits.admissionDate, new Date(filters.admissionDateFrom)))
  }

  if (filters.admissionDateTo) {
    conditions.push(lte(visits.admissionDate, new Date(filters.admissionDateTo)))
  }

  return conditions
}

/**
 * Calculate days in hospital from admission date
 */
export function calculateDaysInHospital(admissionDate: Date): number {
  const today = new Date()
  const days = Math.max(
    1,
    Math.ceil((admissionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )
  return days
}

/**
 * Check if a visit is locked (ready for billing)
 * Returns error message if locked, null if not locked
 */
export async function checkVisitLocked(visitId: string): Promise<string | null> {
  const [visit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)

  if (!visit) {
    return "Visit not found"
  }

  // If visit is ready for billing, it's locked
  if (visit.status === "ready_for_billing") {
    return "Tidak dapat mengubah data - Visit sudah terkunci (ready for billing)"
  }

  return null
}

/**
 * Fetch latest vitals for multiple visits efficiently
 * Uses window function to avoid N+1 queries
 */
export async function fetchLatestVitalsForVisits(
  visitIds: string[]
): Promise<Map<string, VitalSigns>> {
  if (visitIds.length === 0) {
    return new Map()
  }

  // Use row_number() window function to get latest vitals per visit
  const latestVitalsSubquery = db
    .select({
      visitId: vitalsHistory.visitId,
      id: vitalsHistory.id,
      temperature: vitalsHistory.temperature,
      bloodPressureSystolic: vitalsHistory.bloodPressureSystolic,
      bloodPressureDiastolic: vitalsHistory.bloodPressureDiastolic,
      pulse: vitalsHistory.pulse,
      respiratoryRate: vitalsHistory.respiratoryRate,
      oxygenSaturation: vitalsHistory.oxygenSaturation,
      weight: vitalsHistory.weight,
      height: vitalsHistory.height,
      bmi: vitalsHistory.bmi,
      painScale: vitalsHistory.painScale,
      consciousness: vitalsHistory.consciousness,
      recordedBy: vitalsHistory.recordedBy,
      recordedAt: vitalsHistory.recordedAt,
      notes: vitalsHistory.notes,
      createdAt: vitalsHistory.createdAt,
      rowNumber:
        sql<number>`row_number() over (partition by ${vitalsHistory.visitId} order by ${vitalsHistory.recordedAt} desc)`.as(
          "row_number"
        ),
    })
    .from(vitalsHistory)
    .where(inArray(vitalsHistory.visitId, visitIds))
    .as("ranked_vitals")

  const latestVitalsList = await db
    .select()
    .from(latestVitalsSubquery)
    .where(eq(latestVitalsSubquery.rowNumber, 1))

  // Convert to Map for O(1) lookup
  return new Map(
    latestVitalsList.map((v) => [
      v.visitId,
      {
        id: v.id,
        visitId: v.visitId,
        temperature: v.temperature,
        bloodPressureSystolic: v.bloodPressureSystolic,
        bloodPressureDiastolic: v.bloodPressureDiastolic,
        pulse: v.pulse,
        respiratoryRate: v.respiratoryRate,
        oxygenSaturation: v.oxygenSaturation,
        weight: v.weight,
        height: v.height,
        bmi: v.bmi,
        painScale: v.painScale,
        consciousness: v.consciousness,
        recordedBy: v.recordedBy,
        recordedAt: v.recordedAt.toISOString(),
        notes: v.notes,
        createdAt: v.createdAt.toISOString(),
      },
    ])
  )
}

/**
 * Room Management Service
 */
export async function getAllRoomsWithOccupancy(statusFilter?: string, roomTypeFilter?: string) {
  // Build query conditions
  const conditions = []

  if (statusFilter) {
    conditions.push(eq(rooms.status, statusFilter))
  }

  if (roomTypeFilter) {
    conditions.push(eq(rooms.roomType, roomTypeFilter))
  }

  // Get all rooms
  const allRooms = await db
    .select()
    .from(rooms)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(rooms.roomNumber)

  // Get active bed assignments
  const activeAssignments = await db
    .select({
      assignment: bedAssignments,
      visit: visits,
      patient: patients,
    })
    .from(bedAssignments)
    .leftJoin(visits, eq(bedAssignments.visitId, visits.id))
    .leftJoin(patients, eq(visits.patientId, patients.id))
    .where(isNull(bedAssignments.dischargedAt))

  // Enrich rooms with occupancy data
  return allRooms.map((room) => {
    const assignmentsInRoom = activeAssignments.filter((a) => a.assignment.roomId === room.id)

    return {
      ...room,
      occupiedBeds: assignmentsInRoom.length,
      assignments: assignmentsInRoom,
      occupancyRate:
        room.bedCount > 0 ? Math.round((assignmentsInRoom.length / room.bedCount) * 100) : 0,
    }
  })
}

export async function createRoom(data: RoomInput) {
  const [newRoom] = await db
    .insert(rooms)
    .values({
      roomNumber: data.roomNumber,
      roomType: data.roomType,
      bedCount: data.bedCount,
      availableBeds: data.bedCount,
      floor: data.floor || null,
      building: data.building || null,
      dailyRate: data.dailyRate,
      facilities: data.facilities || null,
      status: "available",
      description: data.description || null,
      isActive: "active",
    })
    .returning()

  return newRoom
}

export async function updateRoom(id: string, updateData: RoomUpdateInput) {
  const [updatedRoom] = await db.update(rooms).set(updateData).where(eq(rooms.id, id)).returning()

  if (!updatedRoom) {
    throw new Error("Room not found")
  }

  return updatedRoom
}

/**
 * Bed Assignment Service
 */
export async function assignBedToPatient(data: BedAssignmentInput) {
  // Check if visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Check if room exists and has available beds
  const [room] = await db.select().from(rooms).where(eq(rooms.id, data.roomId)).limit(1)

  if (!room) {
    throw new Error("Room not found")
  }

  if (room.availableBeds <= 0) {
    throw new Error("No available beds in this room")
  }

  // Check if bed is already occupied
  const existingAssignment = await db
    .select()
    .from(bedAssignments)
    .where(
      and(
        eq(bedAssignments.roomId, data.roomId),
        eq(bedAssignments.bedNumber, data.bedNumber),
        isNull(bedAssignments.dischargedAt)
      )
    )
    .limit(1)

  if (existingAssignment.length > 0) {
    throw new Error("Bed is already occupied")
  }

  // Create bed assignment
  const [newAssignment] = await db
    .insert(bedAssignments)
    .values({
      visitId: data.visitId,
      roomId: data.roomId,
      bedNumber: data.bedNumber,
      assignedAt: new Date(),
      notes: data.notes || null,
      createdAt: new Date(),
    })
    .returning()

  // Update room available beds count
  await db
    .update(rooms)
    .set({
      availableBeds: room.availableBeds - 1,
      status: room.availableBeds - 1 === 0 ? "occupied" : room.status,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, data.roomId))

  // Update visit with room ID
  await db
    .update(visits)
    .set({
      roomId: data.roomId,
      admissionDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(visits.id, data.visitId))

  return newAssignment
}

export async function dischargePatientFromBed(assignmentId: string) {
  // Get assignment details
  const [assignment] = await db
    .select()
    .from(bedAssignments)
    .where(eq(bedAssignments.id, assignmentId))
    .limit(1)

  if (!assignment) {
    throw new Error("Assignment not found")
  }

  if (assignment.dischargedAt) {
    throw new Error("Patient already discharged from this bed")
  }

  // Update assignment with discharge time
  await db
    .update(bedAssignments)
    .set({
      dischargedAt: new Date(),
    })
    .where(eq(bedAssignments.id, assignmentId))

  // Get room info
  const [room] = await db.select().from(rooms).where(eq(rooms.id, assignment.roomId)).limit(1)

  if (room) {
    // Update room available beds count
    await db
      .update(rooms)
      .set({
        availableBeds: room.availableBeds + 1,
        status: "available",
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, assignment.roomId))
  }
}

/**
 * Vital Signs Service
 */
export async function recordVitalSigns(data: VitalSignsInput) {
  // Check if visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Calculate BMI if height and weight provided
  const bmi = data.height && data.weight ? calculateBMI(data.height, data.weight) : null

  // Create vital signs record
  const [newVitals] = await db
    .insert(vitalsHistory)
    .values({
      visitId: data.visitId,
      temperature: data.temperature || null,
      bloodPressureSystolic: data.bloodPressureSystolic || null,
      bloodPressureDiastolic: data.bloodPressureDiastolic || null,
      pulse: data.pulse || null,
      respiratoryRate: data.respiratoryRate || null,
      oxygenSaturation: data.oxygenSaturation || null,
      weight: data.weight || null,
      height: data.height || null,
      bmi: bmi || null,
      painScale: data.painScale || null,
      consciousness: data.consciousness || null,
      recordedBy: data.recordedBy,
      recordedAt: new Date(),
      notes: data.notes || null,
    })
    .returning()

  return newVitals
}

export async function getVitalSignsHistory(visitId: string) {
  const results = await db
    .select({
      vitals: vitalsHistory,
      recordedByUser: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(vitalsHistory)
    .leftJoin(user, eq(vitalsHistory.recordedBy, user.id))
    .where(eq(vitalsHistory.visitId, visitId))
    .orderBy(desc(vitalsHistory.recordedAt))

  // Transform results to include user name in recordedBy field
  return results.map((result) => ({
    ...result.vitals,
    recordedBy: result.recordedByUser?.name || result.recordedByUser?.email || "Unknown User",
  }))
}

/**
 * Medical Record Service (Progress Notes)
 * Note: Function names kept as "CPPT" for backward compatibility
 */
export async function createCPPTEntry(data: CPPTInput) {
  // Check if visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Create medical record entry with recordType='progress_note'
  const [newRecord] = await db
    .insert(medicalRecords)
    .values({
      visitId: data.visitId,
      authorId: data.authorId,
      authorRole: data.authorRole,
      recordType: "progress_note", // Set as progress note
      soapSubjective: data.soapObjective || null,
      soapObjective: data.soapObjective || null,
      soapAssessment: data.soapAssessment || null,
      soapPlan: data.soapPlan || null,
      progressNote: data.progressNote,
      instructions: data.instructions || null,
      isLocked: false,
      isDraft: false,
    })
    .returning()

  return newRecord
}

export async function getCPPTEntries(visitId: string) {
  const results = await db
    .select({
      medicalRecord: medicalRecords,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(medicalRecords)
    .leftJoin(user, eq(medicalRecords.authorId, user.id))
    .where(
      and(
        eq(medicalRecords.visitId, visitId),
        eq(medicalRecords.recordType, "progress_note") // Filter by progress notes only
      )
    )
    .orderBy(desc(medicalRecords.createdAt))

  // Transform results to include author name and map to CPPT format for backward compatibility
  return results.map((result) => ({
    id: result.medicalRecord.id,
    visitId: result.medicalRecord.visitId,
    authorId: result.medicalRecord.authorId,
    authorRole: result.medicalRecord.authorRole,
    subjective: result.medicalRecord.soapSubjective,
    objective: result.medicalRecord.soapObjective,
    assessment: result.medicalRecord.soapAssessment,
    plan: result.medicalRecord.soapPlan,
    progressNote: result.medicalRecord.progressNote || "",
    instructions: result.medicalRecord.instructions,
    createdAt: result.medicalRecord.createdAt.toISOString(),
    authorName: result.author?.name || result.author?.email || "Unknown User",
  }))
}

/**
 * Material Usage Service
 * Uses unified inventory system - materials are in "drugs" table with item_type='material'
 */
export async function recordMaterialUsage(data: MaterialUsageInput) {
  const session = await getSession()
  const quantityUsed = parseFloat(data.quantity)

  // 1. Get material details
  const material = await getMaterialById(data.itemId)

  // 2. Find or validate batch
  const batch = data.batchId
    ? await validateBatch(data.batchId, data.itemId, quantityUsed)
    : await findAvailableBatch(data.itemId, quantityUsed)

  if (!batch) {
    const availableStock = await checkStockAvailability(data.itemId)
    throw new Error(
      `Insufficient stock. Available: ${availableStock} ${material.unit}, Requested: ${quantityUsed} ${material.unit}`
    )
  }

  // 3. Calculate pricing
  const unitPrice = parseFloat(material.price)
  const totalPrice = (unitPrice * quantityUsed).toFixed(2)

  // 4. Deduct stock from batch
  await deductStock(batch.id, quantityUsed)

  // 5. Create stock movement record
  const stockMovement = await createStockMovement({
    inventoryId: batch.id,
    quantity: quantityUsed,
    reason: "Used for patient visit (inpatient material usage)",
    referenceId: data.visitId,
    performedBy: session?.user.id,
  })

  // 6. Create material usage record for billing
  await db
    .insert(materialUsage)
    .values({
      visitId: data.visitId,
      itemId: data.itemId,
      materialName: material.name,
      quantity: data.quantity,
      unit: material.unit,
      unitPrice: material.price,
      totalPrice,
      usedBy: session?.user.id || null,
      notes: data.notes || null,
      stockMovementId: stockMovement.id,
    })
    .returning()
}

export async function getMaterialUsage(visitId: string) {
  const materials = await db
    .select()
    .from(materialUsage)
    .where(eq(materialUsage.visitId, visitId))
    .orderBy(desc(materialUsage.usedAt))

  // Calculate total cost
  const totalCost = materials.reduce((sum, item) => {
    return sum + parseFloat(item.totalPrice || "0")
  }, 0)

  return {
    materials,
    totalCost: totalCost.toFixed(2),
  }
}

/**
 * Patient Detail Service
 * Fetches comprehensive patient detail data for inpatient view
 */
export async function getPatientDetailData(visitId: string) {
  // Get patient and visit information
  const visitResult = await db
    .select()
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .where(eq(visits.id, visitId))
    .limit(1)

  if (visitResult.length === 0) {
    return null
  }

  const visitData = {
    visitId: visitResult[0].visits.id,
    visitNumber: visitResult[0].visits.visitNumber,
    visitType: visitResult[0].visits.visitType,
    admissionDate: visitResult[0].visits.admissionDate,
    dischargeDate: visitResult[0].visits.dischargeDate,
    status: visitResult[0].visits.status,
    patientId: visitResult[0].patients.id,
    mrNumber: visitResult[0].patients.mrNumber,
    patientName: visitResult[0].patients.name,
    nik: visitResult[0].patients.nik,
    dateOfBirth: visitResult[0].patients.dateOfBirth,
    gender: visitResult[0].patients.gender,
    address: visitResult[0].patients.address,
    phone: visitResult[0].patients.phone,
    insurance: visitResult[0].patients.insuranceType,
  }

  // Get current bed assignment
  const bedAssignmentResult = await db
    .select({
      assignmentId: bedAssignments.id,
      roomId: rooms.id,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      bedNumber: bedAssignments.bedNumber,
      assignedAt: bedAssignments.assignedAt,
      dischargedAt: bedAssignments.dischargedAt,
      notes: bedAssignments.notes,
      dailyRate: rooms.dailyRate,
    })
    .from(bedAssignments)
    .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
    .where(and(eq(bedAssignments.visitId, visitId), isNull(bedAssignments.dischargedAt)))
    .orderBy(desc(bedAssignments.assignedAt))
    .limit(1)

  const currentBedAssignment = bedAssignmentResult.length > 0 ? bedAssignmentResult[0] : null

  // Get bed assignment history (all assignments including discharged ones)
  const bedAssignmentHistoryRaw = await db
    .select({
      id: bedAssignments.id,
      roomId: bedAssignments.roomId,
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      bedNumber: bedAssignments.bedNumber,
      assignedAt: bedAssignments.assignedAt,
      dischargedAt: bedAssignments.dischargedAt,
      notes: bedAssignments.notes,
      assignedBy: bedAssignments.assignedBy,
      assignedByName: user.name,
      dailyRate: rooms.dailyRate,
    })
    .from(bedAssignments)
    .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
    .leftJoin(user, eq(bedAssignments.assignedBy, user.id))
    .where(eq(bedAssignments.visitId, visitId))
    .orderBy(desc(bedAssignments.assignedAt))

  // Calculate cost for each assignment period
  const bedAssignmentHistory = bedAssignmentHistoryRaw.map((assignment) => {
    const startDate = new Date(assignment.assignedAt)
    const endDate = assignment.dischargedAt ? new Date(assignment.dischargedAt) : new Date()
    const days = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    const totalCost = parseFloat(assignment.dailyRate) * days

    return {
      ...assignment,
      days,
      totalCost: totalCost.toFixed(2),
    }
  })

  // Get vital signs history (with user names)
  const vitals = await getVitalSignsHistory(visitId)

  // Get CPPT entries (with author names)
  const cpptEntries = await getCPPTEntries(visitId)

  // Get material usage
  const materials = await db
    .select({
      materialUsage,
      usedByUser: user.name,
    })
    .from(materialUsage)
    .leftJoin(user, eq(materialUsage.usedBy, user.id))
    .where(eq(materialUsage.visitId, visitId))
    .orderBy(desc(materialUsage.usedAt))

  // Calculate total material cost
  const totalMaterialCost = materials.reduce((sum, item) => {
    return sum + parseFloat(item.materialUsage.totalPrice || "0")
  }, 0)

  // Calculate days in hospital
  const daysInHospital = visitData.admissionDate
    ? calculateDaysInHospital(new Date(visitData.admissionDate))
    : 0

  // Calculate total room cost
  const totalRoomCost = currentBedAssignment
    ? parseFloat(currentBedAssignment.dailyRate) * daysInHospital
    : 0

  // Fetch prescriptions
  const prescriptions = await getInpatientPrescriptions(visitId)

  // Fetch procedures
  const procedures = await getInpatientProcedures(visitId)

  // Fetch discharge summary (if exists)
  const dischargeSummaryResult = await db
    .select({
      dischargeSummary: dischargeSummaries,
      dischargedByUser: user,
    })
    .from(dischargeSummaries)
    .leftJoin(user, eq(dischargeSummaries.dischargedBy, user.id))
    .where(eq(dischargeSummaries.visitId, visitId))
    .limit(1)

  const dischargeSummary =
    dischargeSummaryResult.length > 0
      ? {
          ...dischargeSummaryResult[0].dischargeSummary,
          dischargedByName: dischargeSummaryResult[0].dischargedByUser?.name || null,
        }
      : null

  return {
    patient: visitData,
    bedAssignment: currentBedAssignment,
    bedAssignmentHistory,
    daysInHospital,
    totalRoomCost: totalRoomCost.toFixed(2),
    vitals,
    cpptEntries,
    totalMaterialCost: totalMaterialCost.toFixed(2),
    materials: materials.map((material) => ({
      ...material.materialUsage,
      usedBy: material.usedByUser,
    })),
    prescriptions,
    procedures,
    dischargeSummary,
  }
}

// ============================================================================
// INPATIENT PRESCRIPTIONS
// ============================================================================

/**
 * Create inpatient prescription order
 */
export async function createInpatientPrescription(data: InpatientPrescriptionInput) {
  await db.insert(prescriptions).values({
    visitId: data.visitId,
    medicalRecordId: data.medicalRecordId || null,
    drugId: data.drugId,
    dosage: data.dosage,
    frequency: data.frequency,
    route: data.route || null,
    duration: data.duration || null,
    quantity: data.quantity,
    instructions: data.instructions || null,
    isRecurring: data.isRecurring || false,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    administrationSchedule: data.administrationSchedule || null,
    notes: data.notes || null,
    isFulfilled: false,
    isAdministered: false,
  })

  return { success: true }
}

/**
 * Get inpatient prescriptions for a visit
 */
export async function getInpatientPrescriptions(visitId: string) {
  const results = await db
    .select({
      prescription: prescriptions,
      drug: drugs,
      administeredBy: administeredByUser,
      fulfilledBy: fulfilledByUser,
    })
    .from(prescriptions)
    .leftJoin(drugs, eq(prescriptions.drugId, drugs.id))
    .leftJoin(administeredByUser, eq(prescriptions.administeredBy, administeredByUser.id))
    .leftJoin(fulfilledByUser, eq(prescriptions.fulfilledBy, fulfilledByUser.id))
    .where(eq(prescriptions.visitId, visitId))
    .orderBy(desc(prescriptions.createdAt))

  return results.map((row) => ({
    ...row.prescription,
    drugName: row.drug?.name,
    drugPrice: row.drug?.price,
    administeredByName: row.administeredBy?.name,
    fulfilledByName: row.fulfilledBy?.name,
  }))
}

/**
 * Mark prescription as administered (for nurses)
 */
export async function administerPrescription(data: AdministerPrescriptionInput) {
  await db
    .update(prescriptions)
    .set({
      isAdministered: true,
      administeredBy: data.administeredBy,
      administeredAt: new Date(),
    })
    .where(eq(prescriptions.id, data.prescriptionId))

  return { success: true }
}

/**
 * Delete inpatient prescription
 */
export async function deleteInpatientPrescription(prescriptionId: string) {
  await db.delete(prescriptions).where(eq(prescriptions.id, prescriptionId))
  return { success: true }
}

// ============================================================================
// INPATIENT PROCEDURES
// ============================================================================

/**
 * Create inpatient procedure order
 */
export async function createInpatientProcedure(data: InpatientProcedureInput) {
  const session = await getSession()

  await db.insert(procedures).values({
    visitId: data.visitId,
    medicalRecordId: data.medicalRecordId || null,
    serviceId: data.serviceId || null,
    description: data.description,
    icd9Code: data.icd9Code || null,
    orderedBy: session?.user.id || null,
    orderedAt: new Date(),
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    status: "ordered",
    notes: data.notes || null,
  })

  return { success: true }
}

/**
 * Get inpatient procedures for a visit
 */
export async function getInpatientProcedures(visitId: string) {
  const results = await db
    .select({
      procedure: procedures,
      service: services,
      orderedBy: orderedByUser,
      performedBy: performedByUser,
    })
    .from(procedures)
    .leftJoin(services, eq(procedures.serviceId, services.id))
    .leftJoin(orderedByUser, eq(procedures.orderedBy, orderedByUser.id))
    .leftJoin(performedByUser, eq(procedures.performedBy, performedByUser.id))
    .where(eq(procedures.visitId, visitId))
    .orderBy(desc(procedures.createdAt))

  return results.map((row) => ({
    ...row.procedure,
    serviceName: row.service?.name,
    servicePrice: row.service?.price,
    orderedByName: row.orderedBy?.name,
    performedByName: row.performedBy?.name,
  }))
}

/**
 * Update procedure status
 */
export async function updateProcedureStatus(data: UpdateProcedureStatusInput) {
  let updateData: PgUpdateSetSource<typeof procedures> = {
    status: data.status,
    notes: data.notes || null,
  }

  // If status is completed, set performedBy and performedAt
  if (data.status === PROCEDURE_STATUS.COMPLETED && data.performedBy) {
    updateData = {
      ...updateData,
      performedBy: data.performedBy,
      performedAt: new Date(),
    }
  }

  await db.update(procedures).set(updateData).where(eq(procedures.id, data.procedureId))

  return { success: true }
}

/**
 * Delete inpatient procedure
 */
export async function deleteInpatientProcedure(procedureId: string) {
  await db.delete(procedures).where(eq(procedures.id, procedureId))
  return { success: true }
}
