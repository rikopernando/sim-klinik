/**
 * Discharge Summary API Endpoint
 * GET /api/inpatient/discharge-summary/{visitId} - Get discharge summary
 * Requires: inpatient:write permission (doctors only)
 */

import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { dischargeSummaries } from "@/db/schema/billing"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * GET /api/inpatient/discharge-summary/{visitId}
 * Retrieve discharge summary for a visit
 */
export const GET = withRBAC(
  async (_request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: "Visit ID is required",
          message: "Visit ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get discharge summary
      const [summary] = await db
        .select()
        .from(dischargeSummaries)
        .where(eq(dischargeSummaries.visitId, visitId))
        .limit(1)

      const response: ResponseApi<typeof summary> = {
        data: summary || null,
        message: summary
          ? "Discharge summary retrieved successfully"
          : "No discharge summary found",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching discharge summary:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch discharge summary"
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
  { permissions: ["inpatient:read"] }
)
