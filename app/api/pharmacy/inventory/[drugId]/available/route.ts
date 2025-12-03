/**
 * Available Batches API
 * Get available (non-expired, in-stock) batches for prescription fulfillment
 */

import { NextRequest, NextResponse } from "next/server"
import { getDrugInventoryByDrugId } from "@/lib/pharmacy/api-service"
import { APIResponse } from "@/types/pharmacy"

/**
 * GET /api/pharmacy/inventory/[drugId]/available
 * Get available batches for a drug (for fulfillment)
 * Returns only non-expired batches with stock > 0, sorted by expiry date (FEFO)
 */
export async function GET(request: NextRequest, context: { params: Promise<{ drugId: string }> }) {
  try {
    const { drugId } = await context.params
    const drugIdNum = parseInt(drugId)

    if (isNaN(drugIdNum)) {
      const response: APIResponse = {
        success: false,
        error: "Invalid drug ID",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const allInventories = await getDrugInventoryByDrugId(drugIdNum)

    // Filter: only non-expired batches with stock > 0
    const availableBatches = allInventories.filter(
      (inv) => inv.stockQuantity > 0 && inv.expiryAlertLevel !== "expired"
    )

    const response: APIResponse = {
      success: true,
      data: availableBatches,
      count: availableBatches.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Available batches fetch error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch available batches",
    }

    return NextResponse.json(response, { status: 500 })
  }
}
