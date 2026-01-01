import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { medicalRecords, visits } from "@/db/schema"
import { billingItems } from "@/db/schema/billing"
import { withRBAC } from "@/lib/rbac/middleware"
import { isValidStatusTransition, VisitStatus } from "@/types/visit-status"
import { lockSchema } from "@/lib/validations/medical-record"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { createBillingFromMedicalRecord, recalculateBilling } from "@/lib/billing/api-service"

/**
 * POST /api/medical-records/lock
 * Lock a medical record (make it immutable)
 * Automatically updates visit status to "ready_for_billing"
 * Requires: medical_records:lock permission
 */
export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()
      const validatedData = lockSchema.parse(body)

      // Check if record exists
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

      if (existing[0].isLocked) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record is already locked",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      const medicalRecord = existing[0]

      // Get the associated visit
      const [visit] = await db
        .select()
        .from(visits)
        .where(eq(visits.id, medicalRecord.visitId))
        .limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Associated visit not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Validate visit status transition to ready_for_billing
      const currentStatus = visit.status as VisitStatus
      const finalStatus: VisitStatus = "ready_for_billing"

      // Can transition from in_examination or examined directly to ready_for_billing
      if (!isValidStatusTransition(currentStatus, finalStatus)) {
        const response: ResponseError<unknown> = {
          error: "Cannot lock medical record",
          message: `Visit status "${currentStatus}" cannot transition to "ready_for_billing". Visit must be in "in_examination" or "examined" status.`,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Wrap all database operations in a transaction
      // Ensures all-or-nothing execution (ACID compliance)
      await db.transaction(async (tx) => {
        // 1. Lock the medical record
        await tx
          .update(medicalRecords)
          .set({
            isLocked: true,
            isDraft: false,
            lockedAt: new Date(),
            lockedBy: user.id,
          })
          .where(eq(medicalRecords.id, validatedData.id))
          .returning()

        // 2. Update visit status to ready_for_billing
        await tx
          .update(visits)
          .set({
            status: finalStatus,
          })
          .where(eq(visits.id, medicalRecord.visitId))
          .returning()

        // 3. Create billing record with all items (pass tx for transaction)
        const billingId = await createBillingFromMedicalRecord(medicalRecord.visitId, tx)

        // 4. Apply doctor's billing adjustment if provided
        if (validatedData.billingAdjustment && validatedData.billingAdjustment !== 0) {
          const adjustmentAmount = validatedData.billingAdjustment
          const isDiscount = adjustmentAmount < 0

          // Add billing item for doctor's adjustment
          await tx.insert(billingItems).values({
            billingId,
            itemType: "adjustment",
            itemId: null,
            itemName: isDiscount ? "Diskon Dokter" : "Biaya Tambahan Dokter",
            itemCode: "DOCTOR_ADJ",
            quantity: 1,
            unitPrice: adjustmentAmount.toString(),
            subtotal: adjustmentAmount.toString(),
            discount: "0",
            totalPrice: adjustmentAmount.toString(),
            description:
              validatedData.adjustmentNote ||
              (isDiscount ? "Diskon diberikan oleh dokter" : "Biaya tambahan dari dokter"),
          })

          // 5. Recalculate billing totals (pass tx for transaction)
          await recalculateBilling(medicalRecord.visitId, tx)
        }
      })

      const response: ResponseApi = {
        message: "Medical record locked successfully. Visit is now ready for billing.",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
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

      console.error("Medical record lock error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to lock medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:lock"] }
)
