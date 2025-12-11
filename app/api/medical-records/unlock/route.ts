import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { medicalRecords, visits } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"
import { VisitStatus } from "@/types/visit-status"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"

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

      // Unlock the medical record
      await db
        .update(medicalRecords)
        .set({
          isLocked: false,
          isDraft: true,
          lockedAt: null,
          lockedBy: null,
        })
        .where(eq(medicalRecords.id, validatedData.id))
        .returning()

      // Revert visit status back to in_examination
      // This allows the record to be locked again later
      const newStatus: VisitStatus = "in_examination"
      await db
        .update(visits)
        .set({
          status: newStatus,
        })
        .where(eq(visits.id, medicalRecord.visitId))
        .returning()

      const response: ResponseApi = {
        message: "Medical record unlocked successfully. Visit status reverted to in_examination.",
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
