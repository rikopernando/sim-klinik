/**
 * Emergency API Service Layer
 * Handles database operations for Emergency module
 */

import { db } from "@/db"
import { visits, patients } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { generateMRNumber, generateVisitNumber, generateQueueNumber } from "@/lib/generators"
import { getInitialVisitStatus, VisitStatus } from "@/types/visit-status"
import { QuickERRegistrationInput, CompleteRegistrationInput, HandoverInput } from "./validation"

/**
 * Quick ER Registration Service
 * Creates both patient and visit records
 */
export async function createQuickERRegistration(data: QuickERRegistrationInput) {
  // Generate MR number
  const mrNumber = await generateMRNumber()

  // Create patient record
  const [newPatient] = await db
    .insert(patients)
    .values({
      mrNumber,
      name: data.name,
      nik: data.nik || null,
      phone: data.phone || null,
      gender: data.gender || null,
      dateOfBirth: data.birthDate ? new Date(data.birthDate) : null,
      address: null,
      insuranceType: "general",
      insuranceNumber: null,
    })
    .returning()

  // Generate visit number
  const visitNumber = await generateVisitNumber()

  // Get initial status for emergency visit
  const initialStatus = getInitialVisitStatus("emergency")

  // Create emergency visit
  const [newVisit] = await db
    .insert(visits)
    .values({
      patientId: newPatient.id,
      visitType: "emergency",
      visitNumber,
      triageStatus: data.triageStatus,
      chiefComplaint: data.chiefComplaint,
      status: initialStatus,
      arrivalTime: new Date(),
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return {
    patient: newPatient,
    visit: newVisit,
  }
}

/**
 * Complete Patient Registration Service
 * Updates patient data from quick registration
 */
export async function completePatientRegistration(data: CompleteRegistrationInput) {
  // Check if patient exists
  const existingPatient = await db
    .select()
    .from(patients)
    .where(eq(patients.id, data.patientId))
    .limit(1)

  if (existingPatient.length === 0) {
    throw new Error("Pasien tidak ditemukan")
  }

  // Update patient with complete data
  const [updatedPatient] = await db
    .update(patients)
    .set({
      nik: data.nik,
      address: data.address,
      dateOfBirth: new Date(data.birthDate),
      gender: data.gender,
      phone: data.phone || null,
      insuranceType: data.insuranceType,
      insuranceNumber: data.insuranceNumber || null,
      updatedAt: new Date(),
    })
    .where(eq(patients.id, data.patientId))
    .returning()

  return updatedPatient
}

/**
 * Handover Service
 * Transfers ER patient to other departments
 * H.1.3 Integration: Resets visit status and validates transitions
 */
export async function performHandover(data: HandoverInput) {
  // Check if visit exists and is an emergency visit
  const existingVisit = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1)

  if (existingVisit.length === 0) {
    throw new Error("Kunjungan tidak ditemukan")
  }

  if (existingVisit[0].visitType !== "emergency") {
    throw new Error("Hanya kunjungan UGD yang dapat di-handover")
  }

  // Get the current and new status
  const currentStatus = existingVisit[0].status as VisitStatus
  const newStatus = getInitialVisitStatus(data.newVisitType)

  // Validate status transition
  // For handover, we allow transition from any emergency status to the new initial status
  // This is a special case where we reset the workflow
  console.log(
    `[Handover] Transitioning from ${currentStatus} (emergency) to ${newStatus} (${data.newVisitType})`
  )

  // Prepare update data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    visitType: data.newVisitType,
    status: newStatus, // Reset status to initial status for new visit type
    updatedAt: new Date(),
  }

  // Add type-specific fields
  if (data.newVisitType === "outpatient") {
    if (!data.poliId) {
      throw new Error("Poli ID wajib diisi untuk rawat jalan")
    }

    const queueNumber = await generateQueueNumber(data.poliId)
    updateData.poliId = data.poliId
    updateData.queueNumber = queueNumber
    updateData.doctorId = data.doctorId || null
    updateData.roomId = null
    updateData.admissionDate = null
    updateData.triageStatus = null // Clear triage status for outpatient
    updateData.chiefComplaint = null // Clear ER-specific field
  } else if (data.newVisitType === "inpatient") {
    if (!data.roomId) {
      throw new Error("Room ID wajib diisi untuk rawat inap")
    }

    updateData.roomId = data.roomId
    updateData.admissionDate = new Date()
    updateData.doctorId = data.doctorId || null
    updateData.poliId = null
    updateData.queueNumber = null
    updateData.triageStatus = null // Clear triage status for inpatient
    updateData.chiefComplaint = null // Clear ER-specific field
  }

  // Add handover notes
  if (data.notes) {
    const existingNotes = existingVisit[0].notes || ""
    const handoverTimestamp = new Date().toLocaleString("id-ID")
    updateData.notes = existingNotes
      ? `${existingNotes}\n\n[HANDOVER - ${handoverTimestamp}] ${data.notes}`
      : `[HANDOVER - ${handoverTimestamp}] ${data.notes}`
  }

  // Update visit
  const [updatedVisit] = await db
    .update(visits)
    .set(updateData)
    .where(eq(visits.id, data.visitId))
    .returning()

  return updatedVisit
}

/**
 * Get ER Queue
 * Fetch all pending emergency visits with patient data
 */
export async function getERQueue() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const queue = await db
    .select({
      visit: visits,
      patient: patients,
    })
    .from(visits)
    .leftJoin(patients, eq(visits.patientId, patients.id))
    .where(and(eq(visits.visitType, "emergency"), eq(visits.status, "pending")))

  return queue
}
