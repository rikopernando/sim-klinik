/**
 * Inpatient Procedures API Route
 * Handles procedure orders for inpatient care
 */

import z from "zod"
import { NextRequest, NextResponse } from "next/server"

import {
  createInpatientProcedure,
  getInpatientProcedures,
  checkVisitLocked,
} from "@/lib/inpatient/api-service"
import { inpatientProcedureSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * GET /api/inpatient/procedures?visitId={visitId}
 * Fetch procedures for a visit
 * Requires: inpatient:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const visitId = searchParams.get("visitId")

      if (!visitId) {
        return NextResponse.json({ error: "Visit ID is required" }, { status: 400 })
      }

      const procedures = await getInpatientProcedures(visitId)

      return NextResponse.json({
        success: true,
        data: procedures,
      })
    } catch (error) {
      console.error("Error fetching procedures:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch procedures" },
        { status: 500 }
      )
    }
  },
  { permissions: ["inpatient:read"] }
)

/**
 * POST /api/inpatient/procedures
 * Create a new procedure order
 * Requires: inpatient:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = inpatientProcedureSchema.parse(body)

      // Check if visit is locked
      const lockError = await checkVisitLocked(validatedData.visitId)
      if (lockError) {
        const response: ResponseError<unknown> = {
          error: "Visit locked",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: lockError,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      await createInpatientProcedure(validatedData)

      const response: ResponseApi = {
        message: "Procedure order created successfully",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating procedure:", error)

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
      const errorMessage = error instanceof Error ? error.message : "Failed to create procedure"
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
