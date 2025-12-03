/**
 * Payment Processing API
 * Handles payment operations with automatic change calculation
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { paymentSchema } from "@/lib/billing/validation"
import { processPayment } from "@/lib/billing/api-service"
import { APIResponse } from "@/types/billing"

/**
 * POST /api/billing/payment
 * Process a payment (supports partial payments)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = paymentSchema.parse(body)

    // Process payment
    const payment = await processPayment(validatedData)

    const response: APIResponse = {
      success: true,
      message: "Payment processed successfully",
      data: payment,
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

    console.error("Payment processing error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process payment",
    }
    return NextResponse.json(response, {
      status:
        error instanceof Error &&
        (error.message === "Billing not found" || error.message.includes("Payment amount"))
          ? 400
          : 500,
    })
  }
}
