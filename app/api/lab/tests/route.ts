/**
 * Lab Tests API
 * GET /api/lab/tests - Search and list lab tests
 * POST /api/lab/tests - Create new lab test (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { labTests } from "@/db/schema/laboratory"
import { ilike, and, eq, or } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import type { CreateLabTestInput } from "@/types/lab"

/**
 * GET /api/lab/tests
 * Search and list lab tests
 * Query params: search, category, department, isActive
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search") || ""
      const category = searchParams.get("category")
      const department = searchParams.get("department")
      const isActive = searchParams.get("isActive")

      // Build where conditions
      const conditions = []

      // Filter by active status (default to true)
      if (isActive !== null) {
        conditions.push(eq(labTests.isActive, isActive === "true"))
      } else {
        conditions.push(eq(labTests.isActive, true))
      }

      // Filter by department
      if (department) {
        conditions.push(eq(labTests.department, department))
      }

      // Filter by category
      if (category) {
        conditions.push(eq(labTests.category, category))
      }

      // Search by code or name
      if (search) {
        conditions.push(
          or(ilike(labTests.code, `%${search}%`), ilike(labTests.name, `%${search}%`))
        )
      }

      // Query lab tests
      const result = await db
        .select({
          id: labTests.id,
          code: labTests.code,
          name: labTests.name,
          category: labTests.category,
          department: labTests.department,
          price: labTests.price,
          specimenType: labTests.specimenType,
          specimenVolume: labTests.specimenVolume,
          specimenContainer: labTests.specimenContainer,
          tatHours: labTests.tatHours,
          requiresFasting: labTests.requiresFasting,
          description: labTests.description,
          instructions: labTests.instructions,
          isActive: labTests.isActive,
        })
        .from(labTests)
        .where(and(...conditions))
        .limit(50)
        .orderBy(labTests.name)

      const response: ResponseApi<typeof result> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab tests fetched successfully",
        data: result,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab tests:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab tests",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * POST /api/lab/tests
 * Create new lab test
 * Requires: lab:write permission (admin only)
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = (await request.json()) as CreateLabTestInput

      // TODO: Add Zod validation for CreateLabTestInput

      // Insert new lab test
      const [newTest] = await db
        .insert(labTests)
        .values({
          code: body.code,
          name: body.name,
          category: body.category,
          department: body.department,
          price: body.price.toString(),
          specimenType: body.specimenType,
          specimenVolume: body.specimenVolume,
          specimenContainer: body.specimenContainer,
          tatHours: body.tatHours,
          loincCode: body.loincCode,
          cptCode: body.cptCode,
          resultTemplate: body.resultTemplate,
          description: body.description,
          instructions: body.instructions,
          requiresFasting: body.requiresFasting,
          isActive: true,
        })
        .returning()

      const response: ResponseApi<typeof newTest> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab test created successfully",
        data: newTest,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab test:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab test",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"], roles: ["admin"] }
)
