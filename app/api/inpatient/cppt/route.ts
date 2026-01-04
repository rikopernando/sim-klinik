/**
 * Inpatient Medical Record (Progress Note) API Endpoint
 * POST /api/inpatient/cppt - Create progress note
 * GET /api/inpatient/cppt?visitId={id} - Get progress note history
 *
 * Note: This endpoint maintains "cppt" in the URL for backward compatibility,
 * but internally uses the unified medical_records table with recordType='progress_note'
 */

import { NextRequest, NextResponse } from "next/server"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { medicalRecordSchema } from "@/lib/inpatient/validation"
import { createCPPTEntry, getCPPTEntries } from "@/lib/inpatient/api-service"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/inpatient/cppt
 * Create progress note (medical record)
 * Requires: inpatient:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest, { user, role }) => {
    try {
      const body = await request.json()

      // Determine author role from authenticated user's role
      const authorRole = role === "doctor" ? ("doctor" as const) : ("nurse" as const)

      // Validate request body and set authorId, authorRole, and recordType
      const validatedData = medicalRecordSchema.parse({
        ...body,
        authorId: user.id,
        authorRole: authorRole,
        recordType: "progress_note", // Explicitly set as progress note
      })

      // Create progress note (uses unified medical records)
      await createCPPTEntry(validatedData)

      const response: ResponseApi = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Progress note created successfully",
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating progress note:", error)

      if (error instanceof Error && error.name === "ZodError") {
        const response: ResponseError<unknown> = {
          error: "Validation failed",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid progress note data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create progress note",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:write"] }
)

/**
 * GET /api/inpatient/cppt
 * Get progress note history (from unified medical records)
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

      // Get progress notes (filters medical_records by recordType='progress_note')
      const entries = await getCPPTEntries(visitId)

      const response: ResponseApi<typeof entries> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Progress notes fetched successfully",
        data: entries,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching progress notes:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch progress notes",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["inpatient:read"] }
)
