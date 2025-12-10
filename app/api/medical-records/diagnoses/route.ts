import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { diagnoses, medicalRecords } from "@/db/schema"
import { Diagnosis } from "@/types/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { createDiagnosisSchema } from "@/lib/validations/medical-record"

/**
 * POST /api/medical-records/diagnoses
 * Create a new diagnosis for a medical record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createDiagnosisSchema.parse(body)

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
        message: "Cannot add diagnosis to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Add diagnosis
    const newDiagnosis = await db
      .insert(diagnoses)
      .values({
        medicalRecordId: validatedData.medicalRecordId,
        icd10Code: validatedData.icd10Code,
        description: validatedData.description,
        diagnosisType: validatedData.diagnosisType,
      })
      .returning()

    const response: ResponseApi<Diagnosis> = {
      message: "Diagnosis added successfully",
      data: newDiagnosis[0],
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

    console.error("Diagnosis creation error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to add diagnosis",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
