import { z } from "zod"
import { eq, and, or, ilike, count, desc } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { labTests } from "@/db/schema/laboratory"
import { createLabTestSchema } from "@/lib/validations/lab-test"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import type { LabTestRecord } from "@/types/lab-test"

export const GET = withRBAC(
  async (req: NextRequest) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
      const offset = (page - 1) * limit
      const search = searchParams.get("search") || ""
      const departmentParam = searchParams.get("department")
      const isActiveParam = searchParams.get("isActive")

      const conditions = []

      if (departmentParam === "LAB" || departmentParam === "RAD") {
        conditions.push(eq(labTests.department, departmentParam))
      }

      if (isActiveParam === "true") {
        conditions.push(eq(labTests.isActive, true))
      } else if (isActiveParam === "false") {
        conditions.push(eq(labTests.isActive, false))
      }

      if (search) {
        const q = `%${search}%`
        conditions.push(or(ilike(labTests.name, q), ilike(labTests.code, q)))
      }

      const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(labTests)
        .where(whereCondition)

      const items = await db
        .select()
        .from(labTests)
        .where(whereCondition)
        .orderBy(desc(labTests.createdAt))
        .limit(limit)
        .offset(offset)

      const response: ResponseApi<LabTestRecord[]> = {
        message: "Data pemeriksaan berhasil diambil",
        data: items as LabTestRecord[],
        status: HTTP_STATUS_CODES.OK,
        meta: { page, limit, total, hasMore: total > page * limit },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab tests:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal mengambil data pemeriksaan",
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
      const validated = createLabTestSchema.parse(body)

      const existing = await db
        .select({ id: labTests.id })
        .from(labTests)
        .where(ilike(labTests.code, validated.code))
        .limit(1)

      if (existing.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Kode pemeriksaan sudah digunakan",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.CONFLICT })
      }

      const [newItem] = await db
        .insert(labTests)
        .values({
          code: validated.code.toUpperCase(),
          name: validated.name,
          category: validated.category,
          department: validated.department,
          price: validated.price.toString(),
          specimenType: validated.specimenType,
          tatHours: validated.tatHours ?? 24,
          requiresFasting: validated.requiresFasting ?? false,
          description: validated.description,
          instructions: validated.instructions,
        })
        .returning()

      const response: ResponseApi<typeof newItem> = {
        message: "Pemeriksaan berhasil ditambahkan",
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

      console.error("Error creating lab test:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Gagal menambahkan pemeriksaan",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"] }
)
