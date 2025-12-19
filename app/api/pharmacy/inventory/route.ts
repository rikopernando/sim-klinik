/**
 * Pharmacy Inventory API
 * Manages drug inventory (stock management)
 */

import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getPaginatedDrugInventory, addDrugInventory } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { DrugInventoryWithDetails } from "@/types/pharmacy"
import { drugInventorySchema, inventoryQuerySchema } from "@/lib/pharmacy/validation"

/**
 * GET /api/pharmacy/inventory
 * Get drug inventories with search and pagination support
 *
 * Query Parameters:
 * - search: Optional search query to filter by drug name
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
    }

    const validationResult = inventoryQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      const response: ResponseError<unknown> = {
        error: validationResult.error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    const { search, page, limit } = validationResult.data

    // Fetch paginated inventory
    const result = await getPaginatedDrugInventory(search, page, limit)

    const response: ResponseApi<DrugInventoryWithDetails[]> = {
      data: result.data,
      message: "Inventory fetched successfully",
      status: HTTP_STATUS_CODES.OK,
      pagination: result.pagination,
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
