import { z } from "zod"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { labTestPanels, labTestPanelItems } from "@/db/schema/laboratory"
import { updateLabPanelSchema } from "@/lib/validations/lab-panel"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

type Params = { id: string }

export const PATCH = withRBAC<Params>(
  async (req: NextRequest, { params }) => {
    try {
      const { id } = params
      const body = await req.json()
      const validated = updateLabPanelSchema.parse(body)

      const existing = await db
        .select({ id: labTestPanels.id })
        .from(labTestPanels)
        .where(eq(labTestPanels.id, id))
        .limit(1)

      if (existing.length === 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Panel tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const updated = await db.transaction(async (tx) => {
        const updateData: Record<string, unknown> = { updatedAt: new Date() }

        if (validated.code !== undefined) updateData.code = validated.code.toUpperCase()
        if (validated.name !== undefined) updateData.name = validated.name
        if (validated.description !== undefined) updateData.description = validated.description
        if (validated.price !== undefined) updateData.price = validated.price.toString()
        if (validated.isActive !== undefined) updateData.isActive = validated.isActive

        const [panel] = await tx
          .update(labTestPanels)
          .set(updateData)
          .where(eq(labTestPanels.id, id))
          .returning()

        // Replace panel items if testIds provided
        if (validated.testIds !== undefined) {
          await tx.delete(labTestPanelItems).where(eq(labTestPanelItems.panelId, id))

          if (validated.testIds.length > 0) {
            await tx
              .insert(labTestPanelItems)
              .values(validated.testIds.map((testId) => ({ panelId: id, testId })))
          }
        }

        return panel
      })

      const response: ResponseApi<typeof updated> = {
        message: "Panel berhasil diperbarui",
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

      console.error("Error updating lab panel:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal memperbarui panel",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
