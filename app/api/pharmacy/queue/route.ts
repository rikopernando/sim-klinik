/**
 * Pharmacy Queue API
 * Manages prescription queue (pending fulfillment)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prescriptionFulfillmentSchema } from "@/lib/pharmacy/validation"
import { getPendingPrescriptions, fulfillPrescription } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import { PrescriptionQueueItem } from "@/types/pharmacy"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { withRBAC } from "@/lib/rbac"

/**
 * GET /api/pharmacy/queue
 * Get all pending prescriptions grouped by visit (not yet fulfilled)
 * Sorted by most recent prescription first
 * Requires: pharmacy:read permission
 */
export const GET = withRBAC(
  async () => {
    try {
      const pendingPrescriptions = await getPendingPrescriptions()

      const response: ResponseApi<PrescriptionQueueItem[]> = {
        message: "Pending prescriptions fetched successfully",
        data: pendingPrescriptions,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Pending prescriptions fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch pending prescriptions",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:read"] }
)

/**
 * POST /api/pharmacy/queue
 * Fulfill a prescription (dispense medication)
 * Requires: pharmacy:fulfill permission
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = prescriptionFulfillmentSchema.parse(body)

      // Fulfill prescription
      await fulfillPrescription(validatedData)

      const response: ResponseApi = {
        message: "Prescription fulfilled successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      console.error("Prescription fulfillment error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to create patient",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["prescriptions:fulfill"] }
)
