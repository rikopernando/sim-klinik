import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { prescriptions, medicalRecords } from "@/db/schema"
import { prescriptionFormSchema } from "@/lib/validations/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * PATCH /api/medical-records/prescriptions/[id]
 * Update a specific prescription
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = prescriptionFormSchema.parse(body)

    // Get prescription and check if medical record is locked
    const prescription = await db
      .select({
        prescription: prescriptions,
        medicalRecord: medicalRecords,
      })
      .from(prescriptions)
      .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
      .where(eq(prescriptions.id, id))
      .limit(1)

    if (prescription.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Prescription not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (prescription[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update prescription to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    if (prescription[0].prescription.isFulfilled) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update prescription fulfilled prescription",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Update prescription
    await db.update(prescriptions).set(validatedData).where(eq(prescriptions.id, id)).returning()

    const response: ResponseApi = {
      message: "Prescription updated successfully",
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
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    console.error("Prescription update error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update prescription",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * DELETE /api/medical-records/prescriptions/[id]
 * Delete a specific prescription
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get prescription and check if medical record is locked
    const prescription = await db
      .select({
        prescription: prescriptions,
        medicalRecord: medicalRecords,
      })
      .from(prescriptions)
      .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
      .where(eq(prescriptions.id, id))
      .limit(1)

    if (prescription.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Prescription not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (prescription[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update prescription to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    if (prescription[0].prescription.isFulfilled) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update prescription fulfilled prescription",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Delete prescription
    await db.delete(prescriptions).where(eq(prescriptions.id, id))

    const response: ResponseApi = {
      message: "Prescription deleted successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Prescription deletion error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to to prescription",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
