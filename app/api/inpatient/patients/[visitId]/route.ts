/**
 * Inpatient Patient Detail API Endpoint
 * GET /api/inpatient/patients/[visitId] - Get detailed patient information
 * Requires: inpatient:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getPatientDetailData } from "@/lib/inpatient/api-service"
import { withRBAC } from "@/lib/rbac/middleware"

interface RouteParams {
  visitId: string
}

export const GET = withRBAC(
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
      const { visitId } = params

      // Fetch patient detail data from service layer
      const patientDetail = await getPatientDetailData(visitId)

      if (!patientDetail) {
        const response: ResponseError<unknown> = {
          error: null,
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Patient visit not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const response: ResponseApi<typeof patientDetail> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Patient detail fetched successfully",
        data: patientDetail,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching patient detail:", error)
      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch patient detail",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:read"] }
)
