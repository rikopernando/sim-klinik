import { z } from "zod"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { labTests } from "@/db/schema/laboratory"
import { updateLabTestSchema } from "@/lib/validations/lab-test"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

type Params = { id: string }

export const PATCH = withRBAC<Params>(
  async (req: NextRequest, { params }) => {
    try {
      const { id } = params
      const body = await req.json()
      const validated = updateLabTestSchema.parse(body)

      const existing = await db
        .select({ id: labTests.id })
        .from(labTests)
        .where(eq(labTests.id, id))
        .limit(1)

      if (existing.length === 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Pemeriksaan tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() }

      if (validated.code !== undefined) updateData.code = validated.code.toUpperCase()
      if (validated.name !== undefined) updateData.name = validated.name
      if (validated.category !== undefined) updateData.category = validated.category
      if (validated.department !== undefined) updateData.department = validated.department
      if (validated.price !== undefined) updateData.price = validated.price.toString()
      if (validated.specimenType !== undefined) updateData.specimenType = validated.specimenType
      if (validated.tatHours !== undefined) updateData.tatHours = validated.tatHours
      if (validated.requiresFasting !== undefined)
        updateData.requiresFasting = validated.requiresFasting
      if (validated.description !== undefined) updateData.description = validated.description
      if (validated.instructions !== undefined) updateData.instructions = validated.instructions
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive

      const [updated] = await db
        .update(labTests)
        .set(updateData)
        .where(eq(labTests.id, id))
        .returning()

      const response: ResponseApi<typeof updated> = {
        message: "Pemeriksaan berhasil diperbarui",
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

      console.error("Error updating lab test:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal memperbarui pemeriksaan",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
