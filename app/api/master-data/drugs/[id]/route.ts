import { z } from "zod"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { inventoryItems } from "@/db/schema/inventory"
import { updateDrugSchema } from "@/lib/validations/drug"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

type Params = { id: string }

export const PATCH = withRBAC<Params>(
  async (req: NextRequest, { params }) => {
    try {
      const { id } = params
      const body = await req.json()
      const validated = updateDrugSchema.parse(body)

      const existing = await db
        .select({ id: inventoryItems.id })
        .from(inventoryItems)
        .where(eq(inventoryItems.id, id))
        .limit(1)

      if (existing.length === 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Obat/bahan tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() }

      if (validated.name !== undefined) updateData.name = validated.name
      if (validated.genericName !== undefined) updateData.genericName = validated.genericName
      if (validated.itemType !== undefined) updateData.itemType = validated.itemType
      if (validated.category !== undefined) updateData.category = validated.category
      if (validated.unit !== undefined) updateData.unit = validated.unit
      if (validated.price !== undefined) updateData.price = validated.price.toString()
      if (validated.generalPrice !== undefined)
        updateData.generalPrice = validated.generalPrice.toString()
      if (validated.minimumStock !== undefined) updateData.minimumStock = validated.minimumStock
      if (validated.requiresPrescription !== undefined)
        updateData.requiresPrescription = validated.requiresPrescription
      if (validated.description !== undefined) updateData.description = validated.description
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive

      const [updated] = await db
        .update(inventoryItems)
        .set(updateData)
        .where(eq(inventoryItems.id, id))
        .returning()

      const response: ResponseApi<typeof updated> = {
        message: "Obat/bahan berhasil diperbarui",
        data: updated,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<typeof error.issues> = {
          error: error.issues,
          message: "Validasi gagal",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      console.error("Error updating drug:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal memperbarui obat/bahan",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["pharmacy:manage_inventory"] }
)
