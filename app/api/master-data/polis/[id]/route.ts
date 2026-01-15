/**
 * Polis API Route - Single Item Operations
 * PATCH /api/master-data/polis/[id] - Update a poli
 * DELETE /api/master-data/polis/[id] - Delete a poli
 */

import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { polis } from "@/db/schema/visits"
import { ResponseApi, ResponseError } from "@/types/api"
import { PayloadPoli } from "@/types/poli"
import { updatePoliSchema } from "@/lib/validations/poli.validation"
import HTTP_STATUS_CODES from "@/lib/constants/http"

type Params = {
  params: Promise<{
    id: string
  }>
}

/**
 * Update a poli
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const validate = updatePoliSchema.parse(body)

    // Check if poli exists
    const existingPoli = await db.select().from(polis).where(eq(polis.id, id)).limit(1)

    if (existingPoli.length === 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Poli not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    // Check if code is being updated and already exists
    if (validate.code && validate.code !== existingPoli[0].code) {
      const codeExists = await db.select().from(polis).where(eq(polis.code, validate.code)).limit(1)

      if (codeExists.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Poli with this code already exists",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.CONFLICT,
        })
      }
    }

    // Update poli
    const updatedPoli = await db
      .update(polis)
      .set({
        name: validate.name,
        code: validate.code,
        description: validate.description,
        isActive: validate.isActive,
      })
      .where(eq(polis.id, id))
      .returning()

    const response: ResponseApi<PayloadPoli> = {
      message: "Poli updated successfully",
      data: updatedPoli[0],
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error updating poli:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update poli",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * Delete a poli (hard delete)
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      const response: ResponseError<null> = {
        error: null,
        message: "Poli ID is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

    // Check if poli exists
    const existingPoli = await db.select().from(polis).where(eq(polis.id, id)).limit(1)

    if (existingPoli.length === 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Poli not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    // Hard delete: remove the record from the table
    await db.delete(polis).where(eq(polis.id, id))

    const response: ResponseApi<null> = {
      message: "Poli deleted successfully",
      data: null,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error deleting poli:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to delete poli",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
