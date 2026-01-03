/**
 * Inpatient Prescriptions API Route
 * Handles prescription orders for inpatient care
 */

import { NextRequest, NextResponse } from "next/server"
import { createInpatientPrescription } from "@/lib/inpatient/api-service"
import { inpatientPrescriptionSchema } from "@/lib/inpatient/validation"
import z from "zod"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/inpatient/prescriptions
 * Create a new prescription order
 * Requires: prescriptions:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = inpatientPrescriptionSchema.parse(body)

      await createInpatientPrescription(validatedData)

      const response: ResponseApi = {
        message: "Prescription order created successfully",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating prescription:", error)

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
      const errorMessage = error instanceof Error ? error.message : "Failed to create prescription"
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
