import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { inventoryBatches, stockMovements } from "@/db/schema/inventory"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

const opnameSchema = z.object({
  items: z
    .array(
      z.object({
        inventoryId: z.string(),
        actualCount: z.number().int().min(0),
        note: z.string().optional(),
      })
    )
    .min(1),
})

export const POST = withRBAC(
  async (req: NextRequest, { user }) => {
    try {
      const body = await req.json()
      const parsed = opnameSchema.safeParse(body)

      if (!parsed.success) {
        const response: ResponseError<unknown> = {
          error: parsed.error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const { items } = parsed.data

      await db.transaction(async (tx) => {
        for (const item of items) {
          const [batch] = await tx
            .select({ stockQuantity: inventoryBatches.stockQuantity })
            .from(inventoryBatches)
            .where(eq(inventoryBatches.id, item.inventoryId))
            .limit(1)

          if (!batch) continue

          const diff = item.actualCount - batch.stockQuantity
          if (diff === 0) continue

          await tx
            .update(inventoryBatches)
            .set({ stockQuantity: item.actualCount, updatedAt: new Date() })
            .where(eq(inventoryBatches.id, item.inventoryId))

          await tx.insert(stockMovements).values({
            inventoryId: item.inventoryId,
            movementType: "adjustment",
            quantity: diff,
            reason: item.note || "Stok opname",
            performedBy: user.id,
          })
        }
      })

      const response: ResponseApi = {
        message: "Stok opname berhasil disimpan",
        status: HTTP_STATUS_CODES.OK,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Stok opname error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menyimpan stok opname",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
