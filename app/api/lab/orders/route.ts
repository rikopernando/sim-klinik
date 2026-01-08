/**
 * Lab Orders API
 * GET /api/lab/orders - List lab orders with filters
 * POST /api/lab/orders - Create new lab order
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { labOrders, labTests, labTestPanels } from "@/db/schema/laboratory"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { and, eq, desc, ilike, inArray } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import type { CreateLabOrderInput } from "@/types/lab"

/**
 * GET /api/lab/orders
 * List lab orders with filters
 * Query params: visitId, patientId, status, department, dateFrom, dateTo
 * Requires: lab:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const visitId = searchParams.get("visitId")
      const patientId = searchParams.get("patientId")
      const status = searchParams.get("status")
      const department = searchParams.get("department")

      // Build where conditions
      const conditions = []

      if (visitId) {
        conditions.push(eq(labOrders.visitId, visitId))
      }

      if (patientId) {
        conditions.push(eq(labOrders.patientId, patientId))
      }

      if (status) {
        // Support multiple statuses separated by comma
        const statuses = status.split(",")
        if (statuses.length > 1) {
          conditions.push(inArray(labOrders.status, statuses))
        } else {
          conditions.push(eq(labOrders.status, status))
        }
      }

      // Query lab orders with relations
      const result = await db
        .select({
          id: labOrders.id,
          visitId: labOrders.visitId,
          patientId: labOrders.patientId,
          testId: labOrders.testId,
          panelId: labOrders.panelId,
          orderNumber: labOrders.orderNumber,
          urgency: labOrders.urgency,
          clinicalIndication: labOrders.clinicalIndication,
          status: labOrders.status,
          price: labOrders.price,
          orderedBy: labOrders.orderedBy,
          orderedAt: labOrders.orderedAt,
          specimenCollectedAt: labOrders.specimenCollectedAt,
          completedAt: labOrders.completedAt,
          verifiedAt: labOrders.verifiedAt,
          notes: labOrders.notes,
          createdAt: labOrders.createdAt,
          // Relations
          test: {
            id: labTests.id,
            code: labTests.code,
            name: labTests.name,
            category: labTests.category,
            department: labTests.department,
          },
          patient: {
            id: patients.id,
            name: patients.name,
            mrNumber: patients.mrNumber,
          },
          orderedByUser: {
            id: user.id,
            name: user.name,
          },
        })
        .from(labOrders)
        .leftJoin(labTests, eq(labOrders.testId, labTests.id))
        .leftJoin(patients, eq(labOrders.patientId, patients.id))
        .leftJoin(user, eq(labOrders.orderedBy, user.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(labOrders.orderedAt))
        .limit(100)

      // Filter by department if specified (after join)
      let filteredResult = result
      if (department) {
        filteredResult = result.filter((order) => order.test?.department === department)
      }

      const response: ResponseApi<typeof filteredResult> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Lab orders fetched successfully",
        data: filteredResult,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching lab orders:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch lab orders",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:read"] }
)

/**
 * POST /api/lab/orders
 * Create new lab order
 * Requires: lab:write permission (doctor)
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = (await request.json()) as CreateLabOrderInput

      // TODO: Add Zod validation

      // Validate that either testId or panelId is provided
      if (!body.testId && !body.panelId) {
        const response: ResponseError<unknown> = {
          error: "Missing test or panel",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Either testId or panelId must be provided",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get test or panel price
      let price = "0"
      if (body.testId) {
        const test = await db.select().from(labTests).where(eq(labTests.id, body.testId)).limit(1)
        if (test.length === 0) {
          const response: ResponseError<unknown> = {
            error: "Test not found",
            status: HTTP_STATUS_CODES.NOT_FOUND,
            message: "Lab test not found",
          }
          return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
        }
        price = test[0].price
      } else if (body.panelId) {
        const panel = await db
          .select()
          .from(labTestPanels)
          .where(eq(labTestPanels.id, body.panelId))
          .limit(1)
        if (panel.length === 0) {
          const response: ResponseError<unknown> = {
            error: "Panel not found",
            status: HTTP_STATUS_CODES.NOT_FOUND,
            message: "Lab test panel not found",
          }
          return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
        }
        price = panel[0].price
      }

      // Generate order number
      // Format: LAB-YYYYMMDD-0001
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "")
      const todayOrders = await db
        .select()
        .from(labOrders)
        .where(ilike(labOrders.orderNumber, `LAB-${dateStr}-%`))
        .orderBy(desc(labOrders.orderNumber))
        .limit(1)

      let orderNumber = `LAB-${dateStr}-0001`
      if (todayOrders.length > 0 && todayOrders[0].orderNumber) {
        const lastNumber = parseInt(todayOrders[0].orderNumber.split("-")[2])
        orderNumber = `LAB-${dateStr}-${String(lastNumber + 1).padStart(4, "0")}`
      }

      // Insert new lab order
      const [newOrder] = await db
        .insert(labOrders)
        .values({
          visitId: body.visitId,
          patientId: body.patientId,
          testId: body.testId,
          panelId: body.panelId,
          orderNumber,
          urgency: body.urgency || "routine",
          clinicalIndication: body.clinicalIndication,
          notes: body.notes,
          orderedBy: user.id,
          price,
          status: "ordered",
        })
        .returning()

      const response: ResponseApi<typeof newOrder> = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Lab order created successfully",
        data: newOrder,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating lab order:", error)

      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to create lab order",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["lab:write"], roles: ["doctor"] }
)
