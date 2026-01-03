/**
 * Administer Prescription API Route
 * POST /api/inpatient/prescriptions/administer
 * For nurses to mark prescriptions as administered
 * Requires: inpatient:write permission
 */

import z from "zod"
import { NextRequest, NextResponse } from "next/server"

import { administerPrescription } from "@/lib/inpatient/api-service"
import { administerPrescriptionSchema } from "@/lib/inpatient/validation"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"

export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = administerPrescriptionSchema.parse(body)

      await administerPrescription(validatedData)

      const response: ResponseApi = {
        message: "Prescription marked as administered",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error administering prescription:", error)

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
        error instanceof Error ? error.message : "Failed to administer prescription"
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
