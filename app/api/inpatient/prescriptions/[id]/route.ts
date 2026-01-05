/**
 * Inpatient Prescription [id] API Route
 * DELETE /api/inpatient/prescriptions/[id]
 * Requires: prescriptions:write permission
 */

import { NextRequest, NextResponse } from "next/server"
import { deleteInpatientPrescription, checkVisitLocked } from "@/lib/inpatient/api-service"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"
import { db } from "@/db"
import { prescriptions } from "@/db/schema/inventory"
import { eq } from "drizzle-orm"

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
          error: "Prescription ID is required",
          message: "Prescription ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get prescription to check visitId
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1)

      if (!prescription) {
        const response: ResponseError<unknown> = {
          error: "Prescription not found",
          message: "Prescription not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Check if visit is locked
      const lockError = await checkVisitLocked(prescription.visitId)
      if (lockError) {
        const response: ResponseError<unknown> = {
          error: "Visit locked",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: lockError,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      await deleteInpatientPrescription(id)

      const response: ResponseApi = {
        message: "Prescription deleted successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error deleting prescription:", error)
      // Handle business logic errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to deleting prescription"
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
  { permissions: ["prescriptions:write"] }
)
