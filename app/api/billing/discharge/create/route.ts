/**
 * Create Discharge Billing API Route
 * POST - Create billing record from discharge aggregation AND update visit status
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { createInpatientDischargeBilling } from "@/lib/billing/api-service"
import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * Request body validation schema
 */
const createDischargeBillingSchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
})

/**
 * POST /api/billing/discharge/create
 * Create billing record for inpatient discharge AND update visit status
 *
 * This endpoint is called when clinical staff completes inpatient treatment.
 * It creates the billing record with all aggregated charges and marks the visit
 * as "ready_for_billing" so it appears in the billing queue.
 *
 * The cashier then processes payment from the billing queue (doesn't create billing).
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDischargeBillingSchema.parse(body)

    // Verify visit exists and is inpatient
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.id, validatedData.visitId))
      .limit(1)

    if (!visit) {
      const response: ResponseError<unknown> = {
        error: "Visit not found",
        message: "Visit not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
    }

    if (visit.visitType !== "inpatient") {
      const response: ResponseError<unknown> = {
        error: "Invalid visit type",
        message: "Only inpatient visits can use this endpoint",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    // Create discharge billing (aggregates all inpatient charges)
    await createInpatientDischargeBilling(validatedData.visitId)

    // Update visit status to ready_for_billing
    // This makes the visit appear in billing queue with billing already created
    await db
      .update(visits)
      .set({
        status: "ready_for_billing",
        // endTime: new Date(),
        // dischargeDate: new Date(),
      })
      .where(and(eq(visits.id, validatedData.visitId), eq(visits.visitType, "inpatient")))

    const response: ResponseApi = {
      message: "Discharge billing created successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error creating discharge billing:", error)

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
      error instanceof Error ? error.message : "Failed to creating discharge billing"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
