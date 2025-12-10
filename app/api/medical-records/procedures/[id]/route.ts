import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { procedures, medicalRecords } from "@/db/schema"
import { procedureItemSchema } from "@/lib/validations/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"

/**
 * PATCH /api/medical-records/procedures/[id]
 * Update a specific procedure
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = procedureItemSchema.parse(body)

    // Get procedure and check if medical record is locked
    const procedure = await db
      .select({
        procedure: procedures,
        medicalRecord: medicalRecords,
      })
      .from(procedures)
      .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
      .where(eq(procedures.id, id))
      .limit(1)

    if (procedure.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Procedure not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (procedure[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update procedure to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Update procedure
    await db.update(procedures).set(validatedData).where(eq(procedures.id, id)).returning()

    const response: ResponseApi = {
      message: "Procedure updated successfully",
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

    console.error("Procedure update error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update procedure",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * DELETE /api/medical-records/procedures/[id]
 * Delete a specific procedure
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get procedure and check if medical record is locked
    const procedure = await db
      .select({
        procedure: procedures,
        medicalRecord: medicalRecords,
      })
      .from(procedures)
      .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
      .where(eq(procedures.id, id))
      .limit(1)

    if (procedure.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Procedure not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (procedure[0].medicalRecord.isLocked) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Cannot update procedure to locked medical record",
        status: HTTP_STATUS_CODES.FORBIDDEN,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.FORBIDDEN,
      })
    }

    // Delete procedure
    await db.delete(procedures).where(eq(procedures.id, id))

    const response: ResponseApi = {
      message: "Procedure deleted successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Procedure deletion error:", error)
    const response: ResponseError<unknown> = {
      error,
      message: "Failed to to procedure",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
