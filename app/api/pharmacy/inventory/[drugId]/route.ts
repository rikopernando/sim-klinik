/**
 * Pharmacy Inventory by Drug API
 * Get inventory for a specific drug
 */

import { NextRequest, NextResponse } from "next/server"
import { getDrugInventoryByDrugId } from "@/lib/pharmacy/api-service"
import { APIResponse } from "@/types/pharmacy"

/**
 * GET /api/pharmacy/inventory/[drugId]
 * Get all inventory batches for a specific drug
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

    const inventories = await getDrugInventoryByDrugId(drugIdNum)

    const response: APIResponse = {
      success: true,
      data: inventories,
      count: inventories.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Inventory by drug fetch error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory",
    }

    return NextResponse.json(response, { status: 500 })
  }
}
