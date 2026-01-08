/**
 * Lab Results API
 * POST /api/lab/results - Create/submit lab result
 * GET /api/lab/results?orderId={id} - Get results for an order
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { labResults, labResultParameters, labOrders } from "@/db/schema/laboratory"
import { eq } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import type { CreateLabResultInput } from "@/types/lab"

/**
 * GET /api/lab/results
 * Get results for an order
 * Query param: orderId (required)
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const orderId = searchParams.get("orderId")

      if (!orderId) {
        const response: ResponseError<unknown> = {
          error: "Missing orderId parameter",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "orderId is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Query results
      const results = await db.select().from(labResults).where(eq(labResults.orderId, orderId))

      // Get parameters for each result
      const resultsWithParameters = await Promise.all(
        results.map(async (result) => {
          const parameters = await db
            .select()
            .from(labResultParameters)
            .where(eq(labResultParameters.resultId, result.id))

          return {
            ...result,
            parameters: parameters.length > 0 ? parameters : undefined,
          }
        })
      )

      const response: ResponseApi<typeof resultsWithParameters> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab results fetched successfully",
        data: resultsWithParameters,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab results:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab results",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * POST /api/lab/results
 * Create/submit lab result
 * Requires: lab:write permission (lab_technician, radiologist)
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = (await request.json()) as CreateLabResultInput

      // TODO: Add Zod validation

      // Check if order exists and is in correct status
      const [order] = await db
        .select()
        .from(labOrders)
        .where(eq(labOrders.id, body.orderId))
        .limit(1)

      if (!order) {
        const response: ResponseError<unknown> = {
          error: "Order not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Lab order not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      if (order.status !== "in_progress" && order.status !== "specimen_collected") {
        const response: ResponseError<unknown> = {
          error: "Invalid order status",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: `Cannot add results to order with status: ${order.status}`,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Insert result
      const [newResult] = await db
        .insert(labResults)
        .values({
          orderId: body.orderId,
          resultData: body.resultData,
          attachmentUrl: body.attachmentUrl,
          attachmentType: body.attachmentType,
          resultNotes: body.resultNotes,
          criticalValue: body.criticalValue || false,
          isVerified: false, // Results start unverified
          enteredBy: user.id,
        })
        .returning()

      // Insert parameters if provided
      if (body.parameters && body.parameters.length > 0) {
        await db.insert(labResultParameters).values(
          body.parameters.map((param) => ({
            resultId: newResult.id,
            parameterName: param.parameterName,
            parameterValue: param.parameterValue,
            unit: param.unit,
            referenceMin: param.referenceMin?.toString(),
            referenceMax: param.referenceMax?.toString(),
            flag: param.flag,
          }))
        )
      }

      // Update order status to completed
      await db
        .update(labOrders)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(labOrders.id, body.orderId))

      // TODO: Create notification for ordering doctor
      // TODO: Auto-create billing item if not already billed

      const response: ResponseApi<typeof newResult> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab result created successfully",
        data: newResult,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab result:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab result",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
