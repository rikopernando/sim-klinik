/**
 * Inpatient CPPT API Endpoint
 * POST /api/inpatient/cppt - Create CPPT entry
 * GET /api/inpatient/cppt?visitId={id} - Get CPPT history
 */

import { NextRequest, NextResponse } from "next/server"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { cpptSchema } from "@/lib/inpatient/validation"
import { createCPPTEntry, getCPPTEntries } from "@/lib/inpatient/api-service"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/inpatient/cppt
 * Create CPPT entry
 * Requires: inpatient:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest, { user, role }) => {
    try {
      const body = await request.json()

      // Determine author role from authenticated user's role
      const authorRole = role === "doctor" ? "doctor" : "nurse"

      // Validate request body and set authorId and authorRole from authenticated user
      const validatedData = cpptSchema.parse({
        ...body,
        authorId: user.id,
        authorRole: authorRole,
      })

      // Create CPPT entry
      await createCPPTEntry(validatedData)

      const response: ResponseApi = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "CPPT entry created successfully",
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating CPPT entry:", error)

      if (error instanceof Error && error.name === "ZodError") {
        const response: ResponseError<unknown> = {
          error: "Validation failed",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid CPPT data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create CPPT entry",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)

/**
 * GET /api/inpatient/cppt
 * Get CPPT history
 * Requires: inpatient:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const visitId = searchParams.get("visitId")

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: "Missing visitId parameter",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "visitId is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get CPPT entries
      const entries = await getCPPTEntries(visitId)

      const response: ResponseApi<typeof entries> = {
        status: HTTP_STATUS_CODES.OK,
        message: "CPPT entries fetched successfully",
        data: entries,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching CPPT entries:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch CPPT entries",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:read"] }
)
