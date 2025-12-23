/**
 * Inpatient API Service Layer
 * Handles database operations for Inpatient module
 */

import { db } from "@/db"
import { rooms, bedAssignments, vitalsHistory, materialUsage } from "@/db/schema/inpatient"
import { cppt } from "@/db/schema/medical-records"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { eq, and, isNull, desc, or, gte, lte, inArray, ilike, sql, SQL } from "drizzle-orm"
import { calculateBMI } from "./vitals-utils"
import type {
  RoomInput,
  BedAssignmentInput,
  VitalSignsInput,
  CPPTInput,
  MaterialUsageInput,
  RoomUpdateInput,
} from "./validation"
import type { InpatientFilters, VitalSigns } from "@/types/inpatient"

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
  return Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24))
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
      createdAt: new Date(),
    })
    .returning()

  return newVitals
}

export async function getVitalSignsHistory(visitId: string) {
  return await db
    .select()
    .from(vitalsHistory)
    .where(eq(vitalsHistory.visitId, visitId))
    .orderBy(desc(vitalsHistory.recordedAt))
}

/**
 * CPPT Service
 */
export async function createCPPTEntry(data: CPPTInput) {
  // Check if visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Create CPPT entry
  const [newCPPT] = await db
    .insert(cppt)
    .values({
      visitId: data.visitId,
      authorId: data.authorId,
      authorRole: data.authorRole,
      subjective: data.subjective || null,
      objective: data.objective || null,
      assessment: data.assessment || null,
      plan: data.plan || null,
      progressNote: data.progressNote,
      instructions: data.instructions || null,
      createdAt: new Date(),
    })
    .returning()

  return newCPPT
}

export async function getCPPTEntries(visitId: string) {
  return await db.select().from(cppt).where(eq(cppt.visitId, visitId)).orderBy(desc(cppt.createdAt))
}

/**
 * Material Usage Service
 */
export async function recordMaterialUsage(data: MaterialUsageInput) {
  // Check if visit exists
  const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (!visit) {
    throw new Error("Visit not found")
  }

  // Calculate total price
  const unitPrice = parseFloat(data.unitPrice)
  const totalPrice = (unitPrice * data.quantity).toFixed(2)

  // Create material usage record
  const [newMaterialUsage] = await db
    .insert(materialUsage)
    .values({
      visitId: data.visitId,
      materialName: data.materialName,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      totalPrice,
      usedBy: data.usedBy || null,
      usedAt: new Date(),
      notes: data.notes || null,
      createdAt: new Date(),
    })
    .returning()

  return newMaterialUsage
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
