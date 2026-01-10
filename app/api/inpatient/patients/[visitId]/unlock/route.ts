/**
 * Inpatient Visit Unlock API Endpoint
 * POST /api/inpatient/patients/[visitId]/unlock
 *
 * Unlocks an inpatient visit that is in 'ready_for_billing' status
 * - Deletes associated billing record if exists
 * - Reverts visit status to 'in_examination'
 * - Blocks unlock if payment has started or completed
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, medicalRecords } from "@/db/schema"
import { billings, billingItems } from "@/db/schema/billing"
import { eq } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { VisitStatus } from "@/types/visit-status"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

interface RouteParams {
  visitId: string
}

/**
 * POST /api/inpatient/patients/[visitId]/unlock
 * Unlock inpatient visit and delete billing
 * Requires: inpatient:write permission + doctor role
 */
export const POST = withRBAC(
  async (
    _request: NextRequest,
    {
      params,
      role,
    }: {
      params: RouteParams
      user: { id: string; email: string; name: string }
      role?: string | null
    }
  ) => {
    try {
      const { visitId } = params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: "Missing visit ID",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Visit ID is required",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Only doctors can unlock visits
      if (role !== "doctor") {
        const response: ResponseError<unknown> = {
          error: "Unauthorized",
          status: HTTP_STATUS_CODES.FORBIDDEN,
          message: "Only doctors can unlock visits",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Get the visit
      const [visit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: "Visit not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "The specified visit does not exist",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Check if visit is ready for billing
      if (visit.status !== "billed") {
        const response: ResponseError<unknown> = {
          error: "Visit not locked",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Visit is not in billed status",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Check if billing exists for this visit
      const existingBilling = await db
        .select()
        .from(billings)
        .where(eq(billings.visitId, visitId))
        .limit(1)

      // Validate billing payment status before unlock
      if (existingBilling.length > 0) {
        const billing = existingBilling[0]
        const paidAmount = parseFloat(billing.paidAmount)

        // Block unlock if payment has started or completed
        if (
          paidAmount > 0 ||
          billing.paymentStatus === "partial" ||
          billing.paymentStatus === "paid"
        ) {
          const response: ResponseError<unknown> = {
            error: "Payment in progress or completed",
            message:
              billing.paymentStatus === "paid"
                ? "Tidak dapat membuka kunci - Pembayaran sudah selesai"
                : "Tidak dapat membuka kunci - Pembayaran sedang dalam proses",
            status: HTTP_STATUS_CODES.BAD_REQUEST,
          }
          return NextResponse.json(response, {
            status: HTTP_STATUS_CODES.BAD_REQUEST,
          })
        }
      }

      // Wrap all operations in transaction for data integrity
      await db.transaction(async (tx) => {
        // 1. Delete billing if exists (payment still pending with 0 paid)
        if (existingBilling.length > 0) {
          const billing = existingBilling[0]

          // Delete all billing items first (foreign key constraint)
          await tx.delete(billingItems).where(eq(billingItems.billingId, billing.id))

          // Delete billing record
          await tx.delete(billings).where(eq(billings.id, billing.id))
        }

        // 2. Revert visit status back to in_examination
        const newStatus: VisitStatus = "in_examination"
        await tx
          .update(visits)
          .set({
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(visits.id, visitId))

        // 3. unLock the medical record
        await tx
          .update(medicalRecords)
          .set({
            isLocked: false,
            lockedAt: null,
            lockedBy: null,
          })
          .where(eq(medicalRecords.visitId, visitId))
          .returning()
      })

      const response: ResponseApi = {
        message:
          existingBilling.length > 0
            ? "Visit berhasil dibuka. Billing dihapus dan status dikembalikan ke in_examination."
            : "Visit berhasil dibuka. Status dikembalikan ke in_examination.",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Inpatient visit unlock error:", error)
      const response: ResponseError<unknown> = {
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Gagal membuka kunci visit",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["inpatient:write"] }
)
