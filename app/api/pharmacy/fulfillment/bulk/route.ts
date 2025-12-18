import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { bulkFulfillPrescriptions } from "@/lib/pharmacy/api-service"
import { bulkPrescriptionFulfillmentSchema } from "@/lib/pharmacy/validation"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"

/**
 * POST /api/pharmacy/fulfillment/bulk
 * Bulk fulfill multiple prescriptions atomically
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      // Validate request body with Zod schema
      const validatedData = bulkPrescriptionFulfillmentSchema.parse(body)

      // Execute bulk fulfillment
      await bulkFulfillPrescriptions(validatedData.prescriptions)

      const response: ResponseApi = {
        message: "Bulk prescription fulfillment successful",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      // Handle Zod validation errors with detailed feedback
      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Handle business logic errors
      console.error("Bulk fulfillment error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to bulk fulfill prescriptions",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["prescriptions:fulfill"] }
)
