/**
 * Lab Orders API
 * GET /api/lab/orders - List lab orders with filters
 * POST /api/lab/orders - Create new lab order
 */

import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getLabOrders, createLabOrder } from "@/lib/lab/service"
import { createLabOrderSchema, labOrderFiltersSchema } from "@/lib/lab/validation"
import { ZodError } from "zod"

/**
 * GET /api/lab/orders
 * List lab orders with filters
 * Query params: visitId, patientId, status, department, dateFrom, dateTo
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Parse and validate query parameters
      const filters = labOrderFiltersSchema.parse({
        visitId: searchParams.get("visitId") || undefined,
        patientId: searchParams.get("patientId") || undefined,
        status: searchParams.get("status") || undefined,
        department: searchParams.get("department") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
      })

      // Get lab orders using service layer
      const result = await getLabOrders(filters)

      const response: ResponseApi<typeof result> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab orders fetched successfully",
        data: result,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab orders:", error)

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
        message: "Failed to fetch lab orders",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read", "inpatient:write"] }
)

/**
 * POST /api/lab/orders
 * Create new lab order
 * Requires: lab:write permission (doctor)
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()

      // Validate request body
      const validatedData = createLabOrderSchema.parse(body)

      // Create lab order using service layer
      const newOrder = await createLabOrder(validatedData, user.id)

      const response: ResponseApi<typeof newOrder> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab order created successfully",
        data: newOrder,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab order:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid lab order data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab order",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write", "inpatient:write"] }
)
