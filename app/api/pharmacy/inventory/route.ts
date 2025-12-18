/**
 * Pharmacy Inventory API
 * Manages drug inventory (stock management)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAllDrugInventory, addDrugInventory } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { DrugInventoryWithDetails } from "@/types/pharmacy"

/**
 * GET /api/pharmacy/inventory
 * Get all drug inventories with details
 */
export async function GET() {
  try {
    const inventories = await getAllDrugInventory()

    const response: ResponseApi<DrugInventoryWithDetails[]> = {
      data: inventories,
      message: "Inventory fetched successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Inventory fetch error:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch inventory",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * POST /api/pharmacy/inventory
 * Add new inventory (stock incoming)
 */
export async function POST(
  request: NextRequest,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const body = await request.json()

    // Validate input
    const schema = z.object({
      drugId: z.string(),
      batchNumber: z.string().min(1),
      expiryDate: z.string().datetime(),
      stockQuantity: z.number().int().positive(),
      purchasePrice: z.string().optional(),
      supplier: z.string().optional(),
      receivedDate: z.string().datetime().optional(),
    })

    const validatedData = schema.parse(body)

    // Add inventory
    const newInventory = await addDrugInventory({
      drugId: validatedData.drugId,
      batchNumber: validatedData.batchNumber,
      expiryDate: new Date(validatedData.expiryDate),
      stockQuantity: validatedData.stockQuantity,
      purchasePrice: validatedData.purchasePrice,
      supplier: validatedData.supplier,
      receivedDate: validatedData.receivedDate ? new Date(validatedData.receivedDate) : undefined,
    })

    const response: APIResponse = {
      success: true,
      message: "Inventory added successfully",
      data: newInventory,
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

    console.error("Inventory add error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add inventory",
    }

    return NextResponse.json(response, { status: 500 })
  }
}
