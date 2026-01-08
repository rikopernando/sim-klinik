/**
 * Lab Order Details API
 * GET /api/lab/orders/[id] - Get order details
 * PUT /api/lab/orders/[id] - Update order status/details
 */

import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { labOrders, labTests, labResults, labResultParameters } from "@/db/schema/laboratory"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import type { OrderStatus, UpdateLabOrderStatusInput } from "@/types/lab"
import { isValidStatusTransition } from "@/types/lab"

/**
 * GET /api/lab/orders/[id]
 * Get order details with results
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id

      // Query order with relations
      const orderResult = await db
        .select({
          id: labOrders.id,
          visitId: labOrders.visitId,
          patientId: labOrders.patientId,
          testId: labOrders.testId,
          panelId: labOrders.panelId,
          orderNumber: labOrders.orderNumber,
          urgency: labOrders.urgency,
          clinicalIndication: labOrders.clinicalIndication,
          status: labOrders.status,
          price: labOrders.price,
          orderedBy: labOrders.orderedBy,
          orderedAt: labOrders.orderedAt,
          specimenCollectedBy: labOrders.specimenCollectedBy,
          specimenCollectedAt: labOrders.specimenCollectedAt,
          specimenNotes: labOrders.specimenNotes,
          processedBy: labOrders.processedBy,
          startedAt: labOrders.startedAt,
          verifiedBy: labOrders.verifiedBy,
          verifiedAt: labOrders.verifiedAt,
          completedAt: labOrders.completedAt,
          notes: labOrders.notes,
          cancelledReason: labOrders.cancelledReason,
          isBilled: labOrders.isBilled,
          createdAt: labOrders.createdAt,
          updatedAt: labOrders.updatedAt,
          // Relations
          test: {
            id: labTests.id,
            code: labTests.code,
            name: labTests.name,
            category: labTests.category,
            department: labTests.department,
            specimenType: labTests.specimenType,
            specimenVolume: labTests.specimenVolume,
            specimenContainer: labTests.specimenContainer,
            resultTemplate: labTests.resultTemplate,
          },
          patient: {
            id: patients.id,
            name: patients.name,
            mrNumber: patients.mrNumber,
            dateOfBirth: patients.dateOfBirth,
          },
          orderedByUser: {
            id: user.id,
            name: user.name,
          },
        })
        .from(labOrders)
        .leftJoin(labTests, eq(labOrders.testId, labTests.id))
        .leftJoin(patients, eq(labOrders.patientId, patients.id))
        .leftJoin(user, eq(labOrders.orderedBy, user.id))
        .where(eq(labOrders.id, orderId))
        .limit(1)

      if (orderResult.length === 0) {
        const response: ResponseError<unknown> = {
          error: "Order not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Lab order not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const order = orderResult[0]

      // Get results if available
      const resultsQuery = await db
        .select({
          id: labResults.id,
          resultData: labResults.resultData,
          attachmentUrl: labResults.attachmentUrl,
          attachmentType: labResults.attachmentType,
          resultNotes: labResults.resultNotes,
          criticalValue: labResults.criticalValue,
          isVerified: labResults.isVerified,
          verifiedBy: labResults.verifiedBy,
          verifiedAt: labResults.verifiedAt,
          enteredBy: labResults.enteredBy,
          enteredAt: labResults.enteredAt,
        })
        .from(labResults)
        .where(eq(labResults.orderId, orderId))
        .limit(1)

      let result = null
      if (resultsQuery.length > 0) {
        result = resultsQuery[0]

        // Get parameters if it's a multi-parameter test
        const parameters = await db
          .select()
          .from(labResultParameters)
          .where(eq(labResultParameters.resultId, result.id))

        result = {
          ...result,
          parameters: parameters.length > 0 ? parameters : undefined,
        }
      }

      const response: ResponseApi<typeof order & { result: typeof result }> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab order details fetched successfully",
        data: {
          ...order,
          result,
        },
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
  async (
    request: NextRequest,
    { params, user }: { params: { id: string }; user: { id: string; email: string; name: string } }
  ) => {
    try {
      const orderId = params.id
      const body = (await request.json()) as UpdateLabOrderStatusInput

      // Get current order
      const [currentOrder] = await db
        .select()
        .from(labOrders)
        .where(eq(labOrders.id, orderId))
        .limit(1)

      if (!currentOrder) {
        const response: ResponseError<unknown> = {
          error: "Order not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Lab order not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Validate status transition
      if (
        currentOrder.status &&
        !isValidStatusTransition(currentOrder.status as OrderStatus, body.status)
      ) {
        const response: ResponseError<unknown> = {
          error: "Invalid status transition",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: `Cannot transition from ${currentOrder.status} to ${body.status}`,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Prepare update data based on status
      const updateData: Record<string, string | Date> = {
        status: body.status,
        updatedAt: new Date(),
      }

      if (body.notes) {
        updateData.notes = body.notes
      }

      if (body.cancelledReason) {
        updateData.cancelledReason = body.cancelledReason
      }

      // Set timestamps and user IDs based on status
      switch (body.status) {
        case "specimen_collected":
          updateData.specimenCollectedBy = user.id
          updateData.specimenCollectedAt = new Date()
          break
        case "in_progress":
          updateData.processedBy = user.id
          updateData.startedAt = new Date()
          break
        case "completed":
          updateData.completedAt = new Date()
          break
        case "verified":
          updateData.verifiedBy = user.id
          updateData.verifiedAt = new Date()
          break
      }

      // Update order
      const [updatedOrder] = await db
        .update(labOrders)
        .set(updateData)
        .where(eq(labOrders.id, orderId))
        .returning()

      const response: ResponseApi<typeof updatedOrder> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab order updated successfully",
        data: updatedOrder,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error updating lab order:", error)

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
