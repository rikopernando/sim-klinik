/**
 * Inpatient CPPT Edit/Delete API Endpoint
 * PUT /api/inpatient/cppt/[id] - Edit CPPT entry (within 2 hours)
 * DELETE /api/inpatient/cppt/[id] - Delete CPPT entry (within 1 hour)
 */

import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { db } from "@/db"
import { cppt } from "@/db/schema/medical-records"
import { cpptSchema } from "@/lib/inpatient/validation"
import { withRBAC } from "@/lib/rbac/middleware"

interface RouteParams {
  id: string
}

/**
 * PUT /api/inpatient/cppt/[id]
 * Update CPPT entry
 * Requires: inpatient:write permission
 */
export const PUT = withRBAC(
  async (
    request: NextRequest,
    {
      params,
      user,
      role,
    }: {
      params: RouteParams
      user: { id: string; email: string; name: string }
      role?: string | null
    }
  ) => {
    try {
      const { id } = params

      if (!id) {
        const response: ResponseError<unknown> = {
          error: "Missing CPPT ID",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "CPPT ID is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get the CPPT record
      const [cpptRecord] = await db.select().from(cppt).where(eq(cppt.id, id))

      if (!cpptRecord) {
        const response: ResponseError<unknown> = {
          error: "CPPT entry not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "The specified CPPT entry does not exist",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Check if record is within 2 hours (7200000 ms)
      const createdAt = new Date(cpptRecord.createdAt)
      const now = new Date()
      const timeDifference = now.getTime() - createdAt.getTime()
      const twoHoursInMs = 7200000

      if (timeDifference > twoHoursInMs) {
        const response: ResponseError<unknown> = {
          error: "Edit time window expired",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: "CPPT entries can only be edited within 2 hours of creation",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      const body = await request.json()
      // Determine author role from authenticated user's role
      const authorRole = role === "doctor" ? "doctor" : "nurse"
      // Validate request body and set authorId and authorRole from authenticated user
      const validatedData = cpptSchema.parse({
        ...body,
        authorId: user.id,
        authorRole: authorRole,
      })

      // Update the record
      const [updatedCPPT] = await db
        .update(cppt)
        .set(validatedData)
        .where(eq(cppt.id, id))
        .returning()

      const response: ResponseApi<typeof updatedCPPT> = {
        status: HTTP_STATUS_CODES.OK,
        message: "CPPT entry updated successfully",
        data: updatedCPPT,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error updating CPPT entry:", error)

      if (error instanceof Error && error.name === "ZodError") {
        const response: ResponseError<unknown> = {
          error: "Validation failed",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid CPPT data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to update CPPT entry",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)

/**
 * DELETE /api/inpatient/cppt/[id]
 * Delete CPPT entry
 * Requires: inpatient:write permission
 */
export const DELETE = withRBAC(
  async (
    _request: NextRequest,
    {
      params,
    }: {
      params: RouteParams
      user: { id: string; email: string; name: string }
      role?: string | null
    }
  ) => {
    try {
      const { id } = params

      if (!id) {
        const response: ResponseError<unknown> = {
          error: "Missing CPPT ID",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "CPPT ID is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get the CPPT record
      const [cpptRecord] = await db.select().from(cppt).where(eq(cppt.id, id))

      if (!cpptRecord) {
        const response: ResponseError<unknown> = {
          error: "CPPT entry not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "The specified CPPT entry does not exist",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Check if record is within 1 hour (3600000 ms)
      const createdAt = new Date(cpptRecord.createdAt)
      const now = new Date()
      const timeDifference = now.getTime() - createdAt.getTime()
      const oneHourInMs = 3600000

      if (timeDifference > oneHourInMs) {
        const response: ResponseError<unknown> = {
          error: "Delete time window expired",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: "CPPT entries can only be deleted within 1 hour of creation",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Delete the record
      await db.delete(cppt).where(eq(cppt.id, id))

      const response: ResponseApi = {
        status: HTTP_STATUS_CODES.OK,
        message: "CPPT entry deleted successfully",
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error deleting CPPT entry:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to delete CPPT entry",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)
