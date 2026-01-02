/**
 * Medical Materials/Supplies API
 * - GET: Fetch available materials from unified inventory
 * - POST: Record material usage for inpatient care
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq, and, ilike, sql } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { inventoryItems, inventoryBatches } from "@/db/schema/inventory"
import { materialUsageSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { recordMaterialUsage } from "@/lib/inpatient/api-service"

/**
 * GET /api/materials
 * Fetch available materials from unified inventory
 * Query params:
 * - search: Filter by material name (optional)
 * - limit: Number of results (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build query conditions
    const conditions = [eq(inventoryItems.itemType, "material"), eq(inventoryItems.isActive, true)]

    if (search) {
      conditions.push(ilike(inventoryItems.name, `%${search}%`))
    }

    // Fetch materials with stock information
    const materials = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        category: inventoryItems.category,
        unit: inventoryItems.unit,
        price: inventoryItems.price,
        minimumStock: inventoryItems.minimumStock,
        description: inventoryItems.description,
        // Aggregate stock from all batches
        totalStock: sql<number>`COALESCE(SUM(${inventoryBatches.stockQuantity}), 0)`.as(
          "total_stock"
        ),
      })
      .from(inventoryItems)
      .leftJoin(
        inventoryBatches,
        and(
          eq(inventoryBatches.drugId, inventoryItems.id),
          sql`${inventoryBatches.expiryDate} >= NOW()` // Only count unexpired stock
        )
      )
      .where(and(...conditions))
      .groupBy(inventoryItems.id)
      .orderBy(inventoryItems.name)
      .limit(limit)

    const response: ResponseApi<typeof materials> = {
      data: materials,
      message: "Materials fetched successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch materials"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * POST /api/materials
 * Record material usage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = materialUsageSchema.parse(body)

    // Check if visit exists
    const visit = await db
      .select()
      .from(visits)
      .where(eq(visits.id, validatedData.visitId))
      .limit(1)

    if (visit.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Associated visit not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    await recordMaterialUsage(validatedData)

    const response: ResponseApi = {
      message: "Material usage recorded successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error recording material usage:", error)
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to record material usage"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
