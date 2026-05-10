import { NextRequest, NextResponse } from "next/server"
import { desc, eq, and, gte, lte, ilike, or, SQL, sql } from "drizzle-orm"
import { db } from "@/db"
import { stockMovements, inventoryBatches, inventoryItems } from "@/db/schema/inventory"
import { user } from "@/db/schema/auth"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

export interface OpnameHistoryItem {
  id: string
  createdAt: string
  drugName: string
  batchNumber: string
  unit: string
  quantity: number
  reason: string | null
  performedByName: string | null
}

export const GET = withRBAC(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
      const offset = (page - 1) * limit
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const search = searchParams.get("search")?.trim()

      const conditions: SQL[] = [eq(stockMovements.movementType, "adjustment")]

      if (dateFrom) {
        conditions.push(gte(stockMovements.createdAt, new Date(dateFrom)))
      }
      if (dateTo) {
        // Include full day by going to end of dateTo
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        conditions.push(lte(stockMovements.createdAt, end))
      }
      if (search) {
        const pattern = `%${search}%`
        conditions.push(
          or(ilike(inventoryItems.name, pattern), ilike(inventoryBatches.batchNumber, pattern))!
        )
      }

      const where = and(...conditions)

      const rows = await db
        .select({
          id: stockMovements.id,
          createdAt: stockMovements.createdAt,
          quantity: stockMovements.quantity,
          reason: stockMovements.reason,
          batchNumber: inventoryBatches.batchNumber,
          drugName: inventoryItems.name,
          unit: inventoryItems.unit,
          performedByName: user.name,
        })
        .from(stockMovements)
        .innerJoin(inventoryBatches, eq(stockMovements.inventoryId, inventoryBatches.id))
        .innerJoin(inventoryItems, eq(inventoryBatches.drugId, inventoryItems.id))
        .leftJoin(user, eq(stockMovements.performedBy, user.id))
        .where(where)
        .orderBy(desc(stockMovements.createdAt))
        .limit(limit)
        .offset(offset)

      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(stockMovements)
        .innerJoin(inventoryBatches, eq(stockMovements.inventoryId, inventoryBatches.id))
        .innerJoin(inventoryItems, eq(inventoryBatches.drugId, inventoryItems.id))
        .where(where)

      const total = countRow?.count ?? 0

      const data: OpnameHistoryItem[] = rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        drugName: r.drugName,
        batchNumber: r.batchNumber,
        unit: r.unit,
        quantity: r.quantity,
        reason: r.reason,
        performedByName: r.performedByName,
      }))

      const response: ResponseApi<OpnameHistoryItem[]> = {
        data,
        message: "History fetched",
        status: HTTP_STATUS_CODES.OK,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Opname history error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal mengambil riwayat opname",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
