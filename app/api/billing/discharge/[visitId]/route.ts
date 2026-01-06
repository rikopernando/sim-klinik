/**
 * Discharge Billing API Routes
 * GET - Preview discharge billing summary
 */

import { NextRequest, NextResponse } from "next/server"
import { getDischargeBillingSummary } from "@/lib/billing/discharge-aggregation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { DischargeBillingSummary } from "@/types/billing"
import { withRBAC } from "@/lib/rbac"

/**
 * GET /api/billing/discharge/[visitId]
 * Get discharge billing summary with itemized breakdown
 */
export const GET = withRBAC(
  async (_request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Invalid visit ID",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Get discharge billing summary
      const summary = await getDischargeBillingSummary(visitId)

      const response: ResponseApi<DischargeBillingSummary> = {
        data: summary,
        message: "Discharge billing summary retrieved successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error getting discharge billing summary:", error)

      // Handle business logic errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to discharge billing summary"
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
  { permissions: ["billing:read"] }
)
