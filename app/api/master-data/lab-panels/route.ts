import { z } from "zod"
import { eq, and, ilike, count, desc, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { labTestPanels, labTestPanelItems, labTests } from "@/db/schema/laboratory"
import { createLabPanelSchema } from "@/lib/validations/lab-panel"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import type { LabPanelRecord } from "@/types/lab-panel"

export const GET = withRBAC(
  async (req: NextRequest) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
      const offset = (page - 1) * limit
      const search = searchParams.get("search") || ""
      const isActiveParam = searchParams.get("isActive")

      const conditions = []

      if (isActiveParam === "true") {
        conditions.push(eq(labTestPanels.isActive, true))
      } else if (isActiveParam === "false") {
        conditions.push(eq(labTestPanels.isActive, false))
      }

      if (search) {
        const q = `%${search}%`
        conditions.push(sql`(${ilike(labTestPanels.name, q)} OR ${ilike(labTestPanels.code, q)})`)
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(labTestPanels)
        .where(whereCondition)

      const panels = await db
        .select()
        .from(labTestPanels)
        .where(whereCondition)
        .orderBy(desc(labTestPanels.createdAt))
        .limit(limit)
        .offset(offset)

      // Attach test count and test details for each panel
      const enriched = await Promise.all(
        panels.map(async (panel) => {
          const panelTests = await db
            .select({
              id: labTests.id,
              code: labTests.code,
              name: labTests.name,
              department: labTests.department,
            })
            .from(labTestPanelItems)
            .innerJoin(labTests, eq(labTestPanelItems.testId, labTests.id))
            .where(eq(labTestPanelItems.panelId, panel.id))

          return { ...panel, tests: panelTests, testCount: panelTests.length }
        })
      )

      const response: ResponseApi<LabPanelRecord[]> = {
        message: "Data panel berhasil diambil",
        data: enriched as LabPanelRecord[],
        status: HTTP_STATUS_CODES.OK,
        meta: { page, limit, total, hasMore: total > page * limit },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab panels:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal mengambil data panel",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

export const POST = withRBAC(
  async (req: NextRequest) => {
    try {
      const body = await req.json()
      const validated = createLabPanelSchema.parse(body)

      const existing = await db
        .select({ id: labTestPanels.id })
        .from(labTestPanels)
        .where(ilike(labTestPanels.code, validated.code))
        .limit(1)

      if (existing.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Kode panel sudah digunakan",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.CONFLICT })
      }

      const newPanel = await db.transaction(async (tx) => {
        const [panel] = await tx
          .insert(labTestPanels)
          .values({
            code: validated.code.toUpperCase(),
            name: validated.name,
            description: validated.description,
            price: validated.price.toString(),
          })
          .returning()

        if (validated.testIds.length > 0) {
          await tx
            .insert(labTestPanelItems)
            .values(validated.testIds.map((testId) => ({ panelId: panel.id, testId })))
        }

        return panel
      })

      const response: ResponseApi<typeof newPanel> = {
        message: "Panel berhasil ditambahkan",
        data: newPanel,
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

      console.error("Error creating lab panel:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menambahkan panel",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
