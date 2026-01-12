/**
 * Inpatient Vital Signs DELETE API Endpoint
 * DELETE /api/inpatient/vitals/[id] - Delete vital signs record (within 1 hour)
 * Requires: inpatient:write permission
 */

import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { vitalsHistory } from "@/db/schema/inpatient"
import { withRBAC } from "@/lib/rbac/middleware"
import { checkVisitLocked } from "@/lib/inpatient/api-service"

interface RouteParams {
  id: string
}

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
          error: "Missing vital signs ID",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Vital signs ID is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get the vital signs record
      const [vitalRecord] = await db.select().from(vitalsHistory).where(eq(vitalsHistory.id, id))

      if (!vitalRecord) {
        const response: ResponseError<unknown> = {
          error: "Vital signs record not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "The specified vital signs record does not exist",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Check if visit is locked
      const lockError = await checkVisitLocked(vitalRecord.visitId)
      if (lockError) {
        const response: ResponseError<unknown> = {
          error: "Visit locked",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: lockError,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Check if record is within 1 hour (3600000 ms)
      const recordedAt = new Date(vitalRecord.recordedAt)
      const now = new Date()
      const timeDifference = now.getTime() - recordedAt.getTime()
      const oneHourInMs = 3600000

      if (timeDifference > oneHourInMs) {
        const response: ResponseError<unknown> = {
          error: "Delete time window expired",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: "Vital signs records can only be deleted within 1 hour of recording",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Delete the record
      await db.delete(vitalsHistory).where(eq(vitalsHistory.id, id))

      const response: ResponseApi<null> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Vital signs record deleted successfully",
        data: null,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error deleting vital signs:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to delete vital signs record",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)
