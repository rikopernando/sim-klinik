/**
 * Pharmacy Queue API
 * Manages prescription queue (pending fulfillment)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prescriptionFulfillmentSchema } from "@/lib/pharmacy/validation"
import { getPendingPrescriptions, fulfillPrescription } from "@/lib/pharmacy/api-service"
import { APIResponse } from "@/types/pharmacy"

/**
 * GET /api/pharmacy/queue
 * Get all pending prescriptions (not yet fulfilled)
 * Sorted by creation date (oldest first)
 */
export async function GET(request: NextRequest) {
  try {
    const pendingPrescriptions = await getPendingPrescriptions()

    const response: APIResponse = {
      success: true,
      data: pendingPrescriptions,
      count: pendingPrescriptions.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Pending prescriptions fetch error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch pending prescriptions",
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/pharmacy/queue
 * Fulfill a prescription (dispense medication)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = prescriptionFulfillmentSchema.parse(body)

    // Fulfill prescription
    const fulfilledPrescription = await fulfillPrescription(validatedData)

    const response: APIResponse = {
      success: true,
      message: "Prescription fulfilled successfully",
      data: fulfilledPrescription,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        success: false,
        error: "Validation error",
        details: error.issues,
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.error("Prescription fulfillment error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fulfill prescription",
    }

    return NextResponse.json(response, {
      status:
        error instanceof Error &&
        (error.message === "Prescription not found" ||
          error.message === "Prescription already fulfilled" ||
          error.message === "Inventory not found" ||
          error.message === "Insufficient stock")
          ? 400
          : 500,
    })
  }
}
