/**
 * Services API
 * GET /api/services
 * Search and retrieve services (for procedure autocomplete)
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { services } from "@/db/schema/billing"
import { ilike, and, eq, or, count } from "drizzle-orm"
import z from "zod"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { createServicesSchema } from "@/lib/validations/services.validation"
import { ResultService } from "@/types/services"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
    const offset = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const includeInactive = searchParams.get("includeInactive") === "true"

    let conditions = undefined
    // Build where conditions
    if (!includeInactive) {
      conditions = eq(services.isActive, true)
    }
    // Add search condition if query exists
    if (search) {
      const q = `%${search}%`
      const searchCondition = or(
        ilike(services.name, q),
        ilike(services.serviceType, q),
        ilike(services.category, q)
      )
      conditions = conditions ? and(conditions, searchCondition) : searchCondition
    }

    const countQuery = conditions
      ? db.select({ count: count() }).from(services).where(conditions)
      : db.select({ count: count() }).from(services)

    const [{ count: total }] = await countQuery
    // Query services
    const queryBuilder = db
      .select({
        id: services.id,
        code: services.code,
        name: services.name,
        serviceType: services.serviceType,
        price: services.price,
        description: services.description,
        category: services.category,
      })
      .from(services)
      .limit(limit) // ← Gunakan limit dari parameter, bukan hardcode 20
      .offset(offset)
      .orderBy(services.name)

    // Tambahkan where hanya jika ada conditions
    const result = conditions ? await queryBuilder.where(conditions) : await queryBuilder

    const response: ResponseApi<ResultService[]> = {
      message: "Services fetched successfully",
      data: result,
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
    console.error("Services search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search services",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validate = createServicesSchema.parse(body)

    const existingServices = await db
      .select()
      .from(services)
      .where(
        or(
          eq(services.name, validate.name),
          eq(services.code, validate.code),
          eq(services.serviceType, validate.serviceType)
        )
      )

    if (existingServices.length > 0) {
      const conflicts: string[] = []

      // Cek semua kemungkinan conflict
      existingServices.forEach((existing) => {
        if (existing.name === validate.name && !conflicts.includes("nama")) {
          conflicts.push("nama")
        }
        if (existing.code === validate.code && !conflicts.includes("kode")) {
          conflicts.push("kode")
        }
        if (existing.serviceType === validate.serviceType && !conflicts.includes("tipe layanan")) {
          conflicts.push("tipe layanan")
        }
      })

      // Generate pesan pintar
      let message = ""

      if (conflicts.length === 1) {
        // Hanya 1 conflict
        message = `Poli dengan ${conflicts[0]} ini sudah ada`
      } else if (conflicts.length === 2) {
        // 2 conflicts
        message = `Poli dengan ${conflicts[0]} dan ${conflicts[1]} ini sudah ada`
      } else {
        // 3 conflicts (semua)
        message = `Poli dengan ${conflicts[0]}, ${conflicts[1]}, dan ${conflicts[2]} ini sudah ada`
      }

      const response: ResponseError<null> = {
        error: null,
        message,
        status: HTTP_STATUS_CODES.CONFLICT,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.CONFLICT,
      })
    }

    const newServices = await db
      .insert(services)
      .values({
        name: validate.name,
        code: validate.code,
        price: String(validate.price), // Ensure it's a number if your DB expects numeric
        // OR if your DB expects a string:
        // price: String(validate.price),
        serviceType: validate.serviceType,
        category: validate.category ?? null,
        description: validate.description ?? null,
      })
      .returning()
    const response: ResponseApi<ResultService> = {
      message: "Poli created successfully",
      data: newServices[0],
      status: HTTP_STATUS_CODES.CREATED,
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<typeof error.issues> = {
        error: error.issues,
        message: "Validasi gagal",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

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
