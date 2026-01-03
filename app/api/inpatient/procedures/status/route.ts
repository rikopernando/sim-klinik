/**
 * Update Procedure Status API Route
 * PATCH /api/inpatient/procedures/status
 * For updating procedure workflow status
 * Requires: inpatient:write permission
 */

import z from "zod"
import { NextRequest, NextResponse } from "next/server"

import { updateProcedureStatus } from "@/lib/inpatient/api-service"
import { updateProcedureStatusSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

export const PATCH = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = updateProcedureStatusSchema.parse(body)

      await updateProcedureStatus(validatedData)

      const response: ResponseApi = {
        message: "Procedure status updated successfully",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error updating procedure status:", error)

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
        error instanceof Error ? error.message : "Failed to update procedure status"
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
