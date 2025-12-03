/**
 * Billing Details API
 * GET /api/billing/[visitId]
 * Returns billing details for a specific visit
 * Auto-calculates billing if it doesn't exist
 */

import { NextRequest, NextResponse } from "next/server"
import { getBillingDetails, createOrUpdateBilling } from "@/lib/services/billing.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest, context: { params: Promise<{ visitId: string }> }) {
  try {
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

    // Try to get existing billing
    let billingDetails = await getBillingDetails(visitIdNum)

    // If billing doesn't exist, auto-calculate it
    if (!billingDetails) {
      // Get authenticated user for audit trail
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      const userId = session?.user?.id || "system"

      // Auto-calculate billing with no discount/insurance by default
      await createOrUpdateBilling(visitIdNum, userId, {
        discount: 0,
        discountPercentage: 0,
        insuranceCoverage: 0,
      })

      // Fetch the newly created billing
      billingDetails = await getBillingDetails(visitIdNum)

      if (!billingDetails) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create billing for this visit",
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: billingDetails,
    })
  } catch (error) {
    console.error("Billing details error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch billing details",
      },
      { status: 500 }
    )
  }
}
