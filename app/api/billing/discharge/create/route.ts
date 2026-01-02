/**
 * Create Discharge Billing API Route
 * POST - Create billing record from discharge aggregation
 */

import { NextRequest, NextResponse } from "next/server"
import { createInpatientDischargeBilling } from "@/lib/billing/api-service"
import { z } from "zod"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * Request body validation schema
 */
const createDischargeBillingSchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
})

/**
 * POST /api/billing/discharge/create
 * Create billing record for inpatient discharge
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDischargeBillingSchema.parse(body)

    // Create discharge billing
    await createInpatientDischargeBilling(validatedData.visitId)

    const response: ResponseApi = {
      message: "Discharge billing created successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error creating discharge billing:", error)

    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    // Handle business logic errors
    const errorMessage =
      error instanceof Error ? error.message : "Failed to creating discharge billing"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
