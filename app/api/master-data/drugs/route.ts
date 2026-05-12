import { z } from "zod"
import { eq, and, or, ilike, count, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { inventoryItems } from "@/db/schema/inventory"
import { createDrugSchema } from "@/lib/validations/drug"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import type { InventoryItemRecord } from "@/types/drug"

export const GET = withRBAC(
  async (req: NextRequest) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
      const offset = (page - 1) * limit
      const search = searchParams.get("search") || ""
      const itemTypeParam = searchParams.get("itemType")
      const isActiveParam = searchParams.get("isActive")

      const conditions = []

      if (itemTypeParam === "drug" || itemTypeParam === "material") {
        conditions.push(eq(inventoryItems.itemType, itemTypeParam))
      }

      if (isActiveParam === "true") {
        conditions.push(eq(inventoryItems.isActive, true))
      } else if (isActiveParam === "false") {
        conditions.push(eq(inventoryItems.isActive, false))
      }

      if (search) {
        const q = `%${search}%`
        conditions.push(or(ilike(inventoryItems.name, q), ilike(inventoryItems.genericName, q)))
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(inventoryItems)
        .where(whereCondition)

      const items = await db
        .select()
        .from(inventoryItems)
        .where(whereCondition)
        .orderBy(desc(inventoryItems.createdAt))
        .limit(limit)
        .offset(offset)

      const response: ResponseApi<InventoryItemRecord[]> = {
        message: "Data obat berhasil diambil",
        data: items as InventoryItemRecord[],
        status: HTTP_STATUS_CODES.OK,
        meta: { page, limit, total, hasMore: total > page * limit },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching drugs:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal mengambil data obat",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:read"] }
)

export const POST = withRBAC(
  async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validated = createDrugSchema.parse(body)

      const existing = await db
        .select({ id: inventoryItems.id })
        .from(inventoryItems)
        .where(ilike(inventoryItems.name, validated.name))
        .limit(1)

      if (existing.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Nama obat/bahan sudah digunakan",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.CONFLICT })
      }

      const [newItem] = await db
        .insert(inventoryItems)
        .values({
          name: validated.name,
          genericName: validated.genericName,
          itemType: validated.itemType,
          category: validated.category,
          unit: validated.unit,
          price: validated.price.toString(),
          generalPrice: validated.generalPrice?.toString(),
          minimumStock: validated.minimumStock ?? 10,
          requiresPrescription: validated.requiresPrescription ?? true,
          description: validated.description,
        })
        .returning()

      const response: ResponseApi<typeof newItem> = {
        message: "Obat/bahan berhasil ditambahkan",
        data: newItem,
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
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      console.error("Error creating drug:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menambahkan obat/bahan",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
