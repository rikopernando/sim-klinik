import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { medicalRecords, diagnoses } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

type Diagnosis = typeof diagnoses.$inferSelect

/**
 * GET /api/medical-records/[visitId]/diagnoses
 * Get diagnoses for a medical record by visit ID
 * Requires: medical_records:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Get medical record ID for this visit
      const [record] = await db
        .select({ id: medicalRecords.id })
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, visitId))
        .limit(1)

      if (!record) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record not found for this visit",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Get diagnoses
      const diagnosisList = await db
        .select()
        .from(diagnoses)
        .where(eq(diagnoses.medicalRecordId, record.id))

      const response: ResponseApi<Diagnosis[]> = {
        message: "Diagnoses fetched successfully",
        data: diagnosisList,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Diagnoses fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch diagnoses",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
