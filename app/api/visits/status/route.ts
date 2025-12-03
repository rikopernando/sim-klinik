import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"
import {
  VisitStatus,
  isValidStatusTransition,
  getStatusTransitionError,
  VISIT_STATUS_INFO,
} from "@/types/visit-status"

/**
 * Update Visit Status Schema
 */
const updateStatusSchema = z.object({
  visitId: z.number().int().positive(),
  newStatus: z.enum([
    "registered",
    "waiting",
    "in_examination",
    "examined",
    "ready_for_billing",
    "billed",
    "paid",
    "completed",
    "cancelled",
  ] as const),
  reason: z.string().optional(), // Optional reason for status change (especially for cancellation)
})

/**
 * PATCH /api/visits/status
 * Update visit status with state machine validation
 * Requires: visits:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()
      const validatedData = updateStatusSchema.parse(body)

      // Get current visit
      const [visit] = await db
        .select()
        .from(visits)
        .where(eq(visits.id, validatedData.visitId))
        .limit(1)

      if (!visit) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 })
      }

      const currentStatus = visit.status as VisitStatus
      const newStatus = validatedData.newStatus

      // Validate status transition
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        return NextResponse.json(
          {
            error: "Invalid status transition",
            message: getStatusTransitionError(currentStatus, newStatus),
            currentStatus,
            attemptedStatus: newStatus,
          },
          { status: 400 }
        )
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
      }

      // Set timestamps based on status
      if (newStatus === "in_examination" && !visit.startTime) {
        updateData.startTime = new Date()
      }

      if (newStatus === "completed" && !visit.endTime) {
        updateData.endTime = new Date()
      }

      if (newStatus === "completed" && visit.visitType === "inpatient" && !visit.dischargeDate) {
        updateData.dischargeDate = new Date()
      }

      // Add cancellation reason to notes if provided
      if (newStatus === "cancelled" && validatedData.reason) {
        const cancellationNote = `\n[CANCELLED by ${user.name} at ${new Date().toISOString()}]\nReason: ${validatedData.reason}`
        updateData.notes = (visit.notes || "") + cancellationNote
      }

      // Update visit status
      const [updatedVisit] = await db
        .update(visits)
        .set(updateData)
        .where(eq(visits.id, validatedData.visitId))
        .returning()

      return NextResponse.json({
        success: true,
        message: `Visit status updated to: ${VISIT_STATUS_INFO[newStatus].label}`,
        data: {
          visitId: updatedVisit.id,
          previousStatus: currentStatus,
          newStatus: updatedVisit.status,
          statusInfo: VISIT_STATUS_INFO[newStatus],
          updatedAt: updatedVisit.updatedAt,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.issues },
          { status: 400 }
        )
      }

      console.error("Visit status update error:", error)
      return NextResponse.json({ error: "Failed to update visit status" }, { status: 500 })
    }
  },
  { permissions: ["visits:write"] }
)

/**
 * GET /api/visits/status?visitId=X
 * Get current visit status and allowed next statuses
 * Requires: visits:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const visitId = searchParams.get("visitId")

      if (!visitId) {
        return NextResponse.json({ error: "visitId query parameter is required" }, { status: 400 })
      }

      // Get visit
      const [visit] = await db
        .select()
        .from(visits)
        .where(eq(visits.id, parseInt(visitId, 10)))
        .limit(1)

      if (!visit) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 })
      }

      const currentStatus = visit.status as VisitStatus
      const statusInfo = VISIT_STATUS_INFO[currentStatus]

      // Import state machine functions
      const { getAllowedNextStatuses, isTerminalStatus } = await import("@/types/visit-status")
      const allowedNextStatuses = getAllowedNextStatuses(currentStatus)
      const isTerminal = isTerminalStatus(currentStatus)

      return NextResponse.json({
        success: true,
        data: {
          visitId: visit.id,
          visitNumber: visit.visitNumber,
          patientId: visit.patientId,
          visitType: visit.visitType,
          currentStatus,
          statusInfo,
          isTerminal,
          allowedNextStatuses: allowedNextStatuses.map((status) => ({
            status,
            info: VISIT_STATUS_INFO[status],
          })),
          timestamps: {
            arrivalTime: visit.arrivalTime,
            startTime: visit.startTime,
            endTime: visit.endTime,
            dischargeDate: visit.dischargeDate,
          },
        },
      })
    } catch (error) {
      console.error("Visit status fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch visit status" }, { status: 500 })
    }
  },
  { permissions: ["visits:read"] }
)
