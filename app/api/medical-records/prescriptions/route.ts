import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { prescriptions, medicalRecords } from "@/db/schema"
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

    // Add prescription (supports both regular drugs and compound recipes)
    await db.insert(prescriptions).values({
      visitId: validatedData.visitId,
      medicalRecordId: validatedData.medicalRecordId,
      isCompound: validatedData.isCompound,
      drugId: validatedData.isCompound ? null : validatedData.drugId,
      compoundRecipeId: validatedData.isCompound ? validatedData.compoundRecipeId : null,
      dosage: validatedData.dosage,
      frequency: validatedData.frequency,
      quantity: validatedData.quantity,
      instructions: validatedData.instructions || null,
      route: validatedData.route || null,
      isFulfilled: false,
    })

    const response: ResponseApi = {
      message: "Prescription added successfully",
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
