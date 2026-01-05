/**
 * Final Discharge API Endpoint
 * POST /api/inpatient/final-discharge - Complete patient discharge
 * Requires: discharge:write permission
 *
 * Workflow:
 * 1. Check discharge summary exists
 * 2. Check billing is paid (LUNAS)
 * 3. Release bed (set dischargedAt)
 * 4. Set visit dischargeDate
 * 5. Update visit status to 'completed'
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq, and, isNull } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { dischargeSummaries, billings } from "@/db/schema/billing"
import { bedAssignments, rooms } from "@/db/schema/inpatient"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

const finalDischargeSchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
})

/**
 * POST /api/inpatient/final-discharge
 * Complete patient discharge after billing is paid
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = finalDischargeSchema.parse(body)

      // 1. Check if visit exists and is inpatient
      const [visit] = await db
        .select()
        .from(visits)
        .where(eq(visits.id, validatedData.visitId))
        .limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: "Visit not found",
          message: "Visit tidak ditemukan",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      if (visit.visitType !== "inpatient") {
        const response: ResponseError<unknown> = {
          error: "Invalid visit type",
          message: "Fitur ini hanya untuk pasien rawat inap",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // 2. Check if discharge summary exists
      const [dischargeSummary] = await db
        .select()
        .from(dischargeSummaries)
        .where(eq(dischargeSummaries.visitId, validatedData.visitId))
        .limit(1)

      if (!dischargeSummary) {
        const response: ResponseError<unknown> = {
          error: "Discharge summary not found",
          message: "Ringkasan medis pulang harus dibuat terlebih dahulu",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // 3. Check if billing exists and is paid
      const [billing] = await db
        .select()
        .from(billings)
        .where(eq(billings.visitId, validatedData.visitId))
        .limit(1)

      if (!billing) {
        const response: ResponseError<unknown> = {
          error: "Billing not found",
          message: "Billing belum dibuat. Gunakan fitur 'Selesai Rawat Inap' terlebih dahulu",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      if (billing.paymentStatus !== "paid") {
        const response: ResponseError<unknown> = {
          error: "Payment not completed",
          message: "Pembayaran belum lunas. Pasien tidak dapat dipulangkan",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // 4. Get current bed assignment
      const [currentAssignment] = await db
        .select()
        .from(bedAssignments)
        .where(
          and(
            eq(bedAssignments.visitId, validatedData.visitId),
            isNull(bedAssignments.dischargedAt)
          )
        )
        .orderBy(bedAssignments.assignedAt)
        .limit(1)

      // 5. Execute final discharge in transaction
      await db.transaction(async (tx) => {
        // Release bed if assigned
        if (currentAssignment) {
          // Update bed assignment with discharge time
          await tx
            .update(bedAssignments)
            .set({
              dischargedAt: new Date(),
            })
            .where(eq(bedAssignments.id, currentAssignment.id))

          // Get room info and update available beds
          const [room] = await tx
            .select()
            .from(rooms)
            .where(eq(rooms.id, currentAssignment.roomId))
            .limit(1)

          if (room) {
            await tx
              .update(rooms)
              .set({
                availableBeds: room.availableBeds + 1,
                status: "available",
                updatedAt: new Date(),
              })
              .where(eq(rooms.id, currentAssignment.roomId))
          }
        }

        // Update visit with discharge date and completed status
        await tx
          .update(visits)
          .set({
            dischargeDate: new Date(),
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(visits.id, validatedData.visitId))
      })

      const response: ResponseApi = {
        message: "Discharge processed successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error processing final discharge:", error)

      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to process final discharge"
      const response: ResponseError<unknown> = {
        error: errorMessage,
        message: errorMessage,
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["discharge:write"] }
)
