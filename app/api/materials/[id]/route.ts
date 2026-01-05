/**
 * Material Usage Delete API
 * DELETE /api/materials/[id]
 * Delete material usage record (within 1 hour constraint)
 * Requires: inpatient:write permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { materialUsage } from "@/db/schema/inpatient"
import { eq } from "drizzle-orm"
import { ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
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
          error: {},
          message: "Material usage ID is required",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Find the material usage record
      const materialRecord = await db
        .select()
        .from(materialUsage)
        .where(eq(materialUsage.id, id))
        .limit(1)

      if (materialRecord.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Material usage record not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Check if visit is locked
      const lockError = await checkVisitLocked(materialRecord[0].visitId)
      if (lockError) {
        const response: ResponseError<unknown> = {
          error: "Visit locked",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: lockError,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Check if the record is within 1 hour of creation
      const usedAt = new Date(materialRecord[0].usedAt)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - usedAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceCreation > 1) {
        const response: ResponseError<unknown> = {
          error: "Cannot delete material usage record",
          message: "Material usage can only be deleted within 1 hour of creation",
          status: HTTP_STATUS_CODES.FORBIDDEN,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.FORBIDDEN,
        })
      }

      // Delete the record
      await db.delete(materialUsage).where(eq(materialUsage.id, id))

      const response = {
        message: "Material usage record deleted successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Material usage delete error:", error)
      // Handle business logic errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete material usage record"
      const response: ResponseError<unknown> = {
        error: errorMessage,
        message: errorMessage,
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["inpatient:write"] }
)
