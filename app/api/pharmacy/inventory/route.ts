/**
 * Pharmacy Inventory API
 * Manages drug inventory (stock management)
 */

import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAllDrugInventory, addDrugInventory } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { DrugInventoryWithDetails } from "@/types/pharmacy"
import { drugInventorySchema } from "@/lib/pharmacy/validation"

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = drugInventorySchema.parse(body)

    // Add inventory
    await addDrugInventory({
      drugId: validatedData.drugId,
      batchNumber: validatedData.batchNumber,
      expiryDate: validatedData.expiryDate,
      stockQuantity: validatedData.stockQuantity,
      purchasePrice: validatedData.purchasePrice,
      supplier: validatedData.supplier,
      receivedDate: validatedData.receivedDate,
    })

    const response: ResponseApi = {
      message: "Drug inventory added successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    // Handle Zod validation errors with detailed feedback
    if (error instanceof ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

    console.error("Inventory add error:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to add inventory",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
