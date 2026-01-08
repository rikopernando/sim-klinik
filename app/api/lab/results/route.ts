/**
 * Lab Results API
 * POST /api/lab/results - Create/submit lab result
 * GET /api/lab/results?orderId={id} - Get results for an order
 */

import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getLabResultsByOrderId, createLabResult } from "@/lib/lab/service"
import { createLabResultSchema } from "@/lib/lab/validation"
import { ZodError } from "zod"

/**
 * GET /api/lab/results
 * Get results for an order
 * Query param: orderId (required)
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const orderId = searchParams.get("orderId")

      if (!orderId) {
        const response: ResponseError<unknown> = {
          error: "Missing orderId parameter",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "orderId is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get results using service layer
      const results = await getLabResultsByOrderId(orderId)

      const response: ResponseApi<typeof results> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab results fetched successfully",
        data: results,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab results:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab results",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * POST /api/lab/results
 * Create/submit lab result
 * Requires: lab:write permission (lab_technician, radiologist)
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()

      // Validate request body
      const validatedData = createLabResultSchema.parse(body)

      // Create result using service layer
      const newResult = await createLabResult(validatedData, user.id)

      const response: ResponseApi<typeof newResult> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab result created successfully",
        data: newResult,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab result:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid lab result data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab result",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
