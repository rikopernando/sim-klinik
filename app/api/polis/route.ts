/**
 * Polis API Route
 * GET /api/polis - Get all active polis/departments
 * POST /api/polis - Create a new poli
 * PATCH /api/polis/[id] - Update a poli
 * DELETE /api/polis/[id] - Delete a poli
 */

import { NextRequest, NextResponse } from "next/server"
import { count, and, or, ilike } from "drizzle-orm"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { polis } from "@/db/schema/visits"
import { ResponseApi, ResponseError } from "@/types/api"
import { ResultPoli } from "@/types/poli"
import HTTP_STATUS_CODES from "@/lib/constans/http"

/**
 * Get all active polis
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
    const offset = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const includeInactive = searchParams.get("includeInactive") === "true"

    // Build base condition
    let baseCondition = undefined
    if (!includeInactive) {
      baseCondition = eq(polis.isActive, "active")
    }

    if (search) {
      const q = `%${search}%`
      const searchCondition = or(ilike(polis.name, q), ilike(polis.code, q))
      baseCondition = baseCondition ? and(baseCondition, searchCondition) : searchCondition
    }

    // Get total count matching filters
    const countQuery = baseCondition
      ? db.select({ count: count() }).from(polis).where(baseCondition)
      : db.select({ count: count() }).from(polis)

    const [{ count: total }] = await countQuery

    // Fetch paginated polis
    const whereCondition = baseCondition

    const allPolis = await db
      .select({
        id: polis.id,
        name: polis.name,
        code: polis.code,
        description: polis.description,
        isActive: polis.isActive,
        createdAt: polis.createdAt,
      })
      .from(polis)
      .where(whereCondition)
      .orderBy(polis.name)
      .limit(limit)
      .offset(offset)

    const response: ResponseApi<ResultPoli[]> = {
      message: "Polis fetched successfully",
      data: allPolis,
      status: HTTP_STATUS_CODES.OK,
      meta: {
        page,
        limit,
        total,
        hasMore: total > page * limit,
      },
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching polis:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch polis data",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

/**
 * Create a new poli
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.code) {
      const response: ResponseError<null> = {
        error: null,
        message: "Name and code are required fields",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

    // Check if code already exists
    const existingPoli = await db.select().from(polis).where(eq(polis.code, body.code)).limit(1)

    if (existingPoli.length > 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Poli with this code already exists",
        status: HTTP_STATUS_CODES.CONFLICT,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.CONFLICT,
      })
    }

    // Create new poli
    const newPoli = await db
      .insert(polis)
      .values({
        name: body.name,
        code: body.code,
        description: body.description || null,
        isActive: body.isActive || "active",
        createdAt: new Date(),
        // updatedAt: new Date(),
      })
      .returning()

    const response: ResponseApi<ResultPoli> = {
      message: "Poli created successfully",
      data: newPoli[0],
      status: HTTP_STATUS_CODES.CREATED,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error creating poli:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to create poli",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
