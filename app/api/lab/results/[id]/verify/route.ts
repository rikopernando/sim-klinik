/**
 * Lab Result Verification API
 * PUT /api/lab/results/[id]/verify - Verify lab result
 */

import { ZodError } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { withRBAC, User } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { verifyLabResult } from "@/lib/lab/service"
import { verifyLabResultSchema } from "@/lib/lab/validation"

/**
 * PUT /api/lab/results/[id]/verify
 * Verify lab result
 * Requires: lab:verify permission (lab_supervisor, radiologist)
 */
export const PUT = withRBAC(
  async (request: NextRequest, { params, user }: { params: { id: string }; user: User }) => {
    try {
      const resultId = params.id
      const body = await request.json()

      // Validate request body (optional notes)
      const validatedData = verifyLabResultSchema.parse(body)

      // Verify result using service layer
      const verifiedResult = await verifyLabResult(resultId, user.id, validatedData.notes)

      const response: ResponseApi<typeof verifiedResult> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab result verified successfully",
        data: verifiedResult,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error verifying lab result:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid verification data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to verify lab result",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:verify"] }
)
