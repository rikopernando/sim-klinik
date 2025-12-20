/**
 * Process Payment API
 * POST /api/billing/[visitId]/payment
 * Processes payment for a billing record
 */

import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getBillingDetails, processPayment } from "@/lib/billing/api-service"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ visitId: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const { visitId } = await context.params
    const visitIdNum = parseInt(visitId)

    if (isNaN(visitIdNum)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid visit ID",
        },
        { status: 400 }
      )
    }

    // Get billing details
    const billingDetails = await getBillingDetails(visitIdNum)

    if (!billingDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Billing not found for this visit",
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { amount, paymentMethod, paymentReference, amountReceived, notes } = body

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount and payment method are required",
        },
        { status: 400 }
      )
    }

    // Validate cash payment
    if (paymentMethod === "cash" && !amountReceived) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount received is required for cash payments",
        },
        { status: 400 }
      )
    }

    const result = await processPayment(billingDetails.billing.id, session.user.id, {
      amount: parseFloat(amount),
      paymentMethod,
      paymentReference,
      amountReceived: amountReceived ? parseFloat(amountReceived) : undefined,
      notes,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Process payment error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process payment",
      },
      { status: 500 }
    )
  }
}
