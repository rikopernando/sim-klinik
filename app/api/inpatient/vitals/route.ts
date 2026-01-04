/**
 * Inpatient Vital Signs API Endpoint
 * POST /api/inpatient/vitals - Record vital signs
 * GET /api/inpatient/vitals?visitId={id} - Get vitals history
 */

import { NextRequest, NextResponse } from "next/server"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { vitalSignsSchema } from "@/lib/inpatient/validation"
import {
  recordVitalSigns as recordVitalSignsService,
  getVitalSignsHistory,
} from "@/lib/inpatient/api-service"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/inpatient/vitals
 * Record vital signs
 * Requires: inpatient:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()

      // Validate request body and override recordedBy with authenticated user ID
      const validatedData = vitalSignsSchema.parse({
        ...body,
        recordedBy: user.id,
      })

      // Record vital signs
      const newVitals = await recordVitalSignsService(validatedData)

      const response: ResponseApi<typeof newVitals> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Vital signs recorded successfully",
        data: newVitals,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error recording vital signs:", error)

      if (error instanceof Error && error.name === "ZodError") {
        const response: ResponseError<unknown> = {
          error: error,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid vital signs data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to record vital signs",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)

/**
 * GET /api/inpatient/vitals
 * Get vitals history
 * Requires: inpatient:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const visitId = searchParams.get("visitId")

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: "Missing visitId parameter",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "visitId is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get vitals history
      const vitals = await getVitalSignsHistory(visitId)

      const response: ResponseApi<typeof vitals> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Vitals history fetched successfully",
        data: vitals,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching vitals history:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch vitals history",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:read"] }
)
