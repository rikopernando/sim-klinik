import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { diagnoses, medicalRecords } from "@/db/schema"
import { Diagnosis } from "@/types/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { diagnosisFormSchema } from "@/lib/validations/medical-record"

/**
 * PATCH /api/medical-records/diagnoses/[id]
 * Update a specific diagnosis
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = diagnosisFormSchema.parse(body)

    // Get diagnosis and check if medical record is locked
    const diagnosis = await db
      .select({
        diagnosis: diagnoses,
        medicalRecord: medicalRecords,
      })
      .from(diagnoses)
      .innerJoin(medicalRecords, eq(diagnoses.medicalRecordId, medicalRecords.id))
      .where(eq(diagnoses.id, id))
      .limit(1)

    if (diagnosis.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Diagnosis not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (diagnosis[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update diagnosis in locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Update diagnosis
    const updatedDiagnosis = await db
      .update(diagnoses)
      .set({
        icd10Code: validatedData.icd10Code,
        description: validatedData.description,
        diagnosisType: validatedData.diagnosisType,
      })
      .where(eq(diagnoses.id, id))
      .returning()

    const response: ResponseApi<Diagnosis> = {
      message: "Diagnosis updated successfully",
      data: updatedDiagnosis[0],
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

    console.error("Diagnosis update error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update diagnosis",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * DELETE /api/medical-records/diagnoses/[id]
 * Delete a specific diagnosis
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get diagnosis and check if medical record is locked
    const diagnosis = await db
      .select({
        diagnosis: diagnoses,
        medicalRecord: medicalRecords,
      })
      .from(diagnoses)
      .innerJoin(medicalRecords, eq(diagnoses.medicalRecordId, medicalRecords.id))
      .where(eq(diagnoses.id, id))
      .limit(1)

    if (diagnosis.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Diagnosis not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (diagnosis[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot delete diagnosis from locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Delete diagnosis
    await db.delete(diagnoses).where(eq(diagnoses.id, id))

    const response: ResponseApi = {
      message: "Diagnosis deleted successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Diagnosis deletion error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to delete diagnosis",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
