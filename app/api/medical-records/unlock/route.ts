import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { medicalRecords, visits } from "@/db/schema"
import { billings, billingItems } from "@/db/schema/billing"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"
import { VisitStatus } from "@/types/visit-status"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

const unlockSchema = z.object({
  id: z.string(),
})

export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = unlockSchema.parse(body)

      const existing = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.id, validatedData.id))
        .limit(1)

      if (existing.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      if (!existing[0].isLocked) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record is not locked",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      const medicalRecord = existing[0]

      // Check if billing exists for this visit
      const existingBilling = await db
        .select()
        .from(billings)
        .where(eq(billings.visitId, medicalRecord.visitId))
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
            error: {},
            message:
              billing.paymentStatus === "paid"
                ? "Cannot unlock medical record. Payment has been completed."
                : "Cannot unlock medical record. Payment is in progress.",
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

        // 2. Unlock the medical record
        await tx
          .update(medicalRecords)
          .set({
            isLocked: false,
            isDraft: true,
            lockedAt: null,
            lockedBy: null,
          })
          .where(eq(medicalRecords.id, validatedData.id))
          .returning()

        // 3. Revert visit status back to in_examination
        const newStatus: VisitStatus = "in_examination"
        await tx
          .update(visits)
          .set({
            status: newStatus,
          })
          .where(eq(visits.id, medicalRecord.visitId))
          .returning()
      })

      const response: ResponseApi = {
        message:
          existingBilling.length > 0
            ? "Medical record unlocked successfully. Billing deleted and visit status reverted to in_examination."
            : "Medical record unlocked successfully. Visit status reverted to in_examination.",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        })
      }

      console.error("Medical record unlock error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to unlock medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:lock"] }
)
