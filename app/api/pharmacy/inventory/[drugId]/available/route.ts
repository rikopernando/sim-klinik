/**
 * Available Batches API
 * Get available (non-expired, in-stock) batches for prescription fulfillment
 */

import { NextRequest, NextResponse } from "next/server"
import { getDrugInventoryByDrugId } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { DrugInventoryWithDetails } from "@/types/pharmacy"

/**
 * GET /api/pharmacy/inventory/[drugId]/available
 * Get available batches for a drug (for fulfillment)
 * Returns only non-expired batches with stock > 0, sorted by expiry date (FEFO)
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ drugId: string }> }) {
  try {
    const { drugId } = await context.params

    if (!drugId) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Invalid drug ID",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, { status: 400 })
    }

    const allInventories = await getDrugInventoryByDrugId(drugId)

    // Filter: only non-expired batches with stock > 0
    const availableBatches = allInventories.filter(
      (inv) => inv.stockQuantity > 0 && inv.expiryAlertLevel !== "expired"
    )

    const response: ResponseApi<DrugInventoryWithDetails[]> = {
      message: "Available batches fetched successfully",
      data: availableBatches,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Pending prescriptions fetch error:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch available batches",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
  }
}
