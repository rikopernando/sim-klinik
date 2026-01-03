/**
 * Inpatient Procedure [id] API Route
 * DELETE /api/inpatient/procedures/[id]
 * Requires: inpatient:write permission
 */

import { NextRequest, NextResponse } from "next/server"
import { deleteInpatientProcedure } from "@/lib/inpatient/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

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
          error: "Procedure ID is required",
          message: "Procedure ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      await deleteInpatientProcedure(id)

      const response: ResponseApi = {
        message: "Procedure deleted successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error deleting procedure:", error)

      // Handle business logic errors
      const errorMessage = error instanceof Error ? error.message : "Failed to deleting procedure"
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
