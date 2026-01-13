import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { prescriptions, medicalRecords, drugs, visits, patients } from "@/db/schema"
import { sendNotification } from "@/lib/notifications/sse-manager"
import { createPrescriptionFormSchema } from "@/lib/validations/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
/**
 * POST /api/medical-records/prescriptions
 * Add a prescription to a medical record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPrescriptionFormSchema.parse(body)

    // Check if medical record exists and is not locked
    const record = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, validatedData.medicalRecordId))
      .limit(1)

    if (record.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Medical record not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (record[0].isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot add prescription to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Add prescription
    const [newPrescription] = await db
      .insert(prescriptions)
      .values({
        visitId: validatedData.visitId,
        medicalRecordId: validatedData.medicalRecordId,
        drugId: validatedData.drugId,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        quantity: validatedData.quantity,
        instructions: validatedData.instructions || null,
        route: validatedData.route || null,
        isFulfilled: false,
      })
      .returning()

    // Fetch complete prescription data for notification (H.1.1)
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

    // Send real-time notification to pharmacy (H.1.1 Integration)
    if (prescriptionWithDetails.length > 0) {
      const data = prescriptionWithDetails[0]
      sendNotification("pharmacy", "new_prescription", {
        prescriptionId: newPrescription.id,
        patientName: data.patient?.name || "Unknown",
        patientMRNumber: data.patient?.mrNumber || "N/A",
        drugName: data.drug?.name || "Unknown",
        dosage: newPrescription.dosage || null,
        frequency: newPrescription.frequency,
        quantity: newPrescription.quantity,
        visitNumber: data.visit?.visitNumber || "N/A",
        visitType: data.visit?.visitType || "unknown",
        createdAt: newPrescription.createdAt,
      })

      console.log(
        `[Notification] New prescription notification sent for patient: ${data.patient?.name}`
      )
    }

    const response: ResponseApi = {
      message: "Diagnosis added successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    console.error("Prescription creation error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to add prescription",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
