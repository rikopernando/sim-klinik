/**
 * Lab Test Panels API
 * GET /api/lab/panels - Get list of test panels with included tests
 */

import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getLabTestPanelsWithTests } from "@/lib/lab/service"

/**
 * GET /api/lab/panels
 * Get list of lab test panels with their included tests
 * Query params: isActive (optional, defaults to true)
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const isActiveParam = searchParams.get("isActive")

      const filters = {
        isActive: isActiveParam === "false" ? false : true,
      }

      // Get panels with tests using service layer
      const panels = await getLabTestPanelsWithTests(filters)

      const response: ResponseApi<typeof panels> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab test panels fetched successfully",
        data: panels,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab test panels:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab test panels",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)
