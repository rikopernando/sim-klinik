/**
 * Drug Master CRUD API
 * Manages drug master data operations
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { drugSchema, drugUpdateSchema } from "@/lib/pharmacy/validation"
import {
  getAllDrugsWithStock,
  getDrugById,
  searchDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
} from "@/lib/pharmacy/api-service"
import { APIResponse } from "@/types/pharmacy"

/**
 * GET /api/drugs
 * Get all drugs with stock info or search by query
 * Query params:
 * - search: string (optional) - search by name or generic name
 * - id: number (optional) - get specific drug by ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const id = searchParams.get("id")

    // Get specific drug by ID
    if (id) {
      const drugId = parseInt(id)
      if (isNaN(drugId)) {
        const response: APIResponse = {
          success: false,
          error: "Invalid drug ID",
        }
        return NextResponse.json(response, { status: 400 })
      }

      const drug = await getDrugById(drugId)
      if (!drug) {
        const response: APIResponse = {
          success: false,
          error: "Drug not found",
        }
        return NextResponse.json(response, { status: 404 })
      }

      const response: APIResponse = {
        success: true,
        data: drug,
      }
      return NextResponse.json(response)
    }

    // Search drugs
    if (search && search.length >= 2) {
      const results = await searchDrugs(search)

      const response: APIResponse = {
        success: true,
        data: results,
        count: results.length,
      }
      return NextResponse.json(response)
    }

    // Get all drugs with stock
    const allDrugs = await getAllDrugsWithStock()

    const response: APIResponse = {
      success: true,
      data: allDrugs,
      count: allDrugs.length,
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Drug fetch error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch drugs",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/drugs
 * Create new drug
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = drugSchema.parse(body)

    // Create drug
    const newDrug = await createDrug(validatedData)

    const response: APIResponse = {
      success: true,
      message: "Drug created successfully",
      data: newDrug,
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

    console.error("Drug creation error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create drug",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * PATCH /api/drugs
 * Update drug information
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = drugUpdateSchema.parse(body)

    // Update drug
    const updatedDrug = await updateDrug(validatedData.id, validatedData)

    const response: APIResponse = {
      success: true,
      message: "Drug updated successfully",
      data: updatedDrug,
    }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: APIResponse = {
        success: false,
        error: "Validation error",
        details: error.issues,
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.error("Drug update error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update drug",
    }
    return NextResponse.json(response, {
      status: error instanceof Error && error.message === "Drug not found" ? 404 : 500,
    })
  }
}

/**
 * DELETE /api/drugs?id=1
 * Soft delete drug (set isActive to false)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      const response: APIResponse = {
        success: false,
        error: "Drug ID is required",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const drugId = parseInt(id)
    if (isNaN(drugId)) {
      const response: APIResponse = {
        success: false,
        error: "Invalid drug ID",
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Soft delete drug
    const deletedDrug = await deleteDrug(drugId)

    const response: APIResponse = {
      success: true,
      message: "Drug deleted successfully",
      data: deletedDrug,
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Drug deletion error:", error)

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete drug",
    }
    return NextResponse.json(response, {
      status: error instanceof Error && error.message === "Drug not found" ? 404 : 500,
    })
  }
}
