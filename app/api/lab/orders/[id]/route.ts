/**
 * Lab Order Details API
 * GET /api/lab/orders/[id] - Get order details
 * PUT /api/lab/orders/[id] - Update order status/details
 */

import { NextRequest, NextResponse } from "next/server"
import { withRBAC, User } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { getLabOrderById, updateLabOrderStatus } from "@/lib/lab/service"
import { updateLabOrderStatusSchema } from "@/lib/lab/validation"
import { ZodError } from "zod"

/**
 * GET /api/lab/orders/[id]
 * Get order details with results
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id

      // Get order using service layer
      const order = await getLabOrderById(orderId)

      if (!order) {
        const response: ResponseError<unknown> = {
          error: "Order not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Lab order not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const response: ResponseApi<typeof order> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab order details fetched successfully",
        data: order,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab order details:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab order details",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * PUT /api/lab/orders/[id]
 * Update order status
 * Requires: lab:write permission
 */
export const PUT = withRBAC(
  async (request: NextRequest, { params, user }: { params: { id: string }; user: User }) => {
    try {
      const orderId = params.id
      const body = await request.json()

      // Validate request body
      const validatedData = updateLabOrderStatusSchema.parse(body)

      // Update order using service layer
      const updatedOrder = await updateLabOrderStatus(orderId, validatedData, user.id)

      const response: ResponseApi<typeof updatedOrder> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab order updated successfully",
        data: updatedOrder,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error updating lab order:", error)

      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid order update data",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to update lab order",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
