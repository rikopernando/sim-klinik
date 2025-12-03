/**
 * Pharmacy Add Prescription API
 * Allows pharmacists to add prescriptions for urgent cases with doctor approval
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { prescriptions, medicalRecords, drugs, visits, patients, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * Pharmacist Prescription Schema
 */
const pharmacistPrescriptionSchema = z.object({
  medicalRecordId: z.number().int().positive(),
  drugId: z.number().int().positive(),
  dosage: z.string().optional().nullable(),
  frequency: z.string().min(1),
  quantity: z.number().int().positive(),
  instructions: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  addedByPharmacistId: z.string().min(1), // Required - which pharmacist is adding
  approvedBy: z.string().min(1), // Required - which doctor approved (can be same as medical record doctor)
  pharmacistNote: z.string().min(1), // Required - reason for adding prescription
})

/**
 * POST /api/pharmacy/prescriptions/add
 * Add a prescription as a pharmacist (urgent cases with doctor approval)
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = pharmacistPrescriptionSchema.parse(body)

      // Check if medical record exists and IS LOCKED
      // Only pharmacists can add to locked records (doctors add to unlocked records)
      const record = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.id, validatedData.medicalRecordId))
        .limit(1)

      if (record.length === 0) {
        return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
      }

      if (!record[0].isLocked) {
        return NextResponse.json(
          {
            error: "Cannot add prescription to unlocked medical record",
            message:
              "Pharmacist can only add prescriptions to locked records for urgent cases. Please ask the doctor to add the prescription if the record is not locked.",
          },
          { status: 403 }
        )
      }

      // Verify the pharmacist exists
      const pharmacist = await db
        .select()
        .from(user)
        .where(eq(user.id, validatedData.addedByPharmacistId))
        .limit(1)

      if (pharmacist.length === 0) {
        return NextResponse.json({ error: "Pharmacist not found" }, { status: 404 })
      }

      // Verify the approving doctor exists
      const doctor = await db
        .select()
        .from(user)
        .where(eq(user.id, validatedData.approvedBy))
        .limit(1)

      if (doctor.length === 0) {
        return NextResponse.json({ error: "Approving doctor not found" }, { status: 404 })
      }

      // Add prescription with pharmacist tracking fields
      const [newPrescription] = await db
        .insert(prescriptions)
        .values({
          medicalRecordId: validatedData.medicalRecordId,
          drugId: validatedData.drugId,
          dosage: validatedData.dosage,
          frequency: validatedData.frequency,
          quantity: validatedData.quantity,
          instructions: validatedData.instructions || null,
          route: validatedData.route || null,
          isFulfilled: false,
          // Pharmacist-specific fields
          addedByPharmacist: true,
          addedByPharmacistId: validatedData.addedByPharmacistId,
          approvedBy: validatedData.approvedBy,
          approvedAt: new Date(),
          pharmacistNote: validatedData.pharmacistNote,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Fetch complete prescription data for notification
      const prescriptionWithDetails = await db
        .select({
          prescription: prescriptions,
          drug: drugs,
          medicalRecord: medicalRecords,
          visit: visits,
          patient: patients,
        })
        .from(prescriptions)
        .leftJoin(drugs, eq(prescriptions.drugId, drugs.id))
        .leftJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
        .leftJoin(visits, eq(medicalRecords.visitId, visits.id))
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(prescriptions.id, newPrescription.id))
        .limit(1)

      // Log pharmacist-added prescription for doctor review
      // TODO: Implement doctor notification system
      if (prescriptionWithDetails.length > 0) {
        const data = prescriptionWithDetails[0]
        console.log(
          `[Pharmacist Prescription] Added by ${pharmacist[0].name}, approved by Dr. ${doctor[0].name} for patient ${data.patient?.name} (${data.patient?.mrNumber}). Drug: ${data.drug?.name}, Quantity: ${newPrescription.quantity}. Reason: ${validatedData.pharmacistNote}`
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: "Resep berhasil ditambahkan oleh farmasi dengan persetujuan dokter.",
          data: {
            prescription: newPrescription,
            pharmacistName: pharmacist[0].name,
            approvedByName: doctor[0].name,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.issues },
          { status: 400 }
        )
      }

      console.error("Pharmacist prescription creation error:", error)
      return NextResponse.json({ error: "Failed to add prescription" }, { status: 500 })
    }
  },
  { permissions: ["prescriptions:fulfill"] }
)
