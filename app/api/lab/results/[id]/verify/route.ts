/**
 * Lab Result Verification API
 * PUT /api/lab/results/[id]/verify - Verify lab result
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { labResults, labOrders } from "@/db/schema/laboratory"
import { eq } from "drizzle-orm"
import { withRBAC, User } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import type { VerifyLabResultInput } from "@/types/lab"

/**
 * PUT /api/lab/results/[id]/verify
 * Verify lab result
 * Requires: lab:verify permission (lab_supervisor, radiologist)
 */
export const PUT = withRBAC(
  async (request: NextRequest, { params, user }: { params: { id: string }; user: User }) => {
    try {
      const resultId = params.id
      const body = (await request.json()) as VerifyLabResultInput

      // Get result
      const [result] = await db
        .select()
        .from(labResults)
        .where(eq(labResults.id, resultId))
        .limit(1)

      if (!result) {
        const response: ResponseError<unknown> = {
          error: "Result not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Lab result not found",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      if (result.isVerified) {
        const response: ResponseError<unknown> = {
          error: "Already verified",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "This result has already been verified",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Update result as verified
      const [verifiedResult] = await db
        .update(labResults)
        .set({
          isVerified: true,
          verifiedBy: user.id,
          verifiedAt: new Date(),
          resultNotes: body.notes || result.resultNotes,
        })
        .where(eq(labResults.id, resultId))
        .returning()

      // Update order status to verified
      await db
        .update(labOrders)
        .set({
          status: "verified",
          verifiedBy: user.id,
          verifiedAt: new Date(),
        })
        .where(eq(labOrders.id, result.orderId))

      // TODO: Create notification for ordering doctor
      // TODO: If critical value, send urgent notification

      const response: ResponseApi<typeof verifiedResult> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab result verified successfully",
        data: verifiedResult,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error verifying lab result:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to verify lab result",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:verify"] }
)
