/**
 * Billing API
 * Handles billing operations and billing engine
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createBillingSchema } from "@/lib/billing/validation"
import {
  getBillingByVisitId,
  createBillingForVisit,
  getPendingBillings,
  getBillingStatistics,
} from "@/lib/billing/api-service"
import { APIResponse } from "@/types/billing"

/**
 * GET /api/billing
 * Get billing by visit ID or get statistics
 * Query params:
 * - visitId: string (optional) - get billing for specific visit
 * - stats: boolean (optional) - get billing statistics
 * - pending: boolean (optional) - get all pending billings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const visitId = searchParams.get("visitId")
    const stats = searchParams.get("stats")
    const pending = searchParams.get("pending")

    // Get statistics
    if (stats === "true") {
      const statistics = await getBillingStatistics()

      const response: APIResponse = {
        success: true,
        data: statistics,
      }
      return NextResponse.json(response)
    }

    // Get pending billings
    if (pending === "true") {
      const pendingBillings = await getPendingBillings()

      const response: APIResponse = {
        success: true,
        data: pendingBillings,
        count: pendingBillings.length,
      }
      return NextResponse.json(response)
    }

    // Get billing by visit ID
    if (visitId) {
      const id = parseInt(visitId)
      if (isNaN(id)) {
        const response: APIResponse = {
          success: false,
          error: "Invalid visit ID",
        }
        return NextResponse.json(response, { status: 400 })
      }

      const billing = await getBillingByVisitId(id)
      if (!billing) {
        const response: APIResponse = {
          success: false,
          error: "Billing not found",
        }
        return NextResponse.json(response, { status: 404 })
      }

      const response: APIResponse = {
        success: true,
        data: billing,
      }
      return NextResponse.json(response)
    }

    const response: APIResponse = {
      success: false,
      error: "Missing required query parameter",
    }
    return NextResponse.json(response, { status: 400 })
  } catch (error) {
    console.error("Billing fetch error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch billing",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/billing
 * Create billing for a visit (runs billing engine)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createBillingSchema.parse(body)

    // Create billing (runs billing engine)
    const billing = await createBillingForVisit(validatedData)

    const response: APIResponse = {
      success: true,
      message: "Billing created successfully",
      data: billing,
    }
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        success: false,
        error: "Validation error",
        details: error.issues,
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.error("Billing creation error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create billing",
    }
    return NextResponse.json(response, {
      status:
        error instanceof Error &&
        (error.message === "Visit not found" ||
          error.message === "Billing already exists for this visit")
          ? 400
          : 500,
    })
  }
}
