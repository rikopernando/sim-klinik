import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { procedures, medicalRecords } from "@/db/schema"
import { createProcedureFormSchema } from "@/lib/validations/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * POST /api/medical-records/procedures
 * Add a procedure to a medical record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProcedureFormSchema.parse(body)

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
        message: "Cannot add procedure to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Add procedure
    await db
      .insert(procedures)
      .values({
        medicalRecordId: validatedData.medicalRecordId,
        serviceId: validatedData.serviceId || null,
        icd9Code: validatedData.icd9Code,
        description: validatedData.description,
        performedBy: validatedData.performedBy || null,
        notes: validatedData.notes || null,
      })
      .returning()

    const response: ResponseApi = {
      message: "Procedure added successfully",
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

    console.error("Procedure creation error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to add procedure",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
