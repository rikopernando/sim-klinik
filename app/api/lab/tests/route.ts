/**
 * Lab Tests API
 * GET /api/lab/tests - Search and list lab tests
 * POST /api/lab/tests - Create new lab test (admin only)
 */

import { ZodError } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getLabTests, createLabTest } from "@/lib/lab/service"
import { createLabTestSchema, labTestFiltersSchema } from "@/lib/lab/validation"

/**
 * GET /api/lab/tests
 * Search and list lab tests
 * Query params: search, category, department, isActive
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Parse and validate query parameters
      const filters = labTestFiltersSchema.parse({
        search: searchParams.get("search") || undefined,
        category: searchParams.get("category") || undefined,
        department: searchParams.get("department") || undefined,
        isActive: searchParams.get("isActive") || undefined,
      })

      // Get lab tests using service layer
      const result = await getLabTests(filters)

      const response: ResponseApi<typeof result> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab tests fetched successfully",
        data: result,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab tests:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid query parameters",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab tests",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * POST /api/lab/tests
 * Create new lab test
 * Requires: lab:write permission (admin only)
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      // Validate request body
      const validatedData = createLabTestSchema.parse(body)

      // Create lab test using service layer
      const newTest = await createLabTest(validatedData)

      const response: ResponseApi<typeof newTest> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab test created successfully",
        data: newTest,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab test:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid lab test data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab test",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"], roles: ["admin"] }
)
