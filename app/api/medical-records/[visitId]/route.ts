import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { medicalRecords, visits } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { MedicalRecord, MedicalRecordCoreData } from "@/types/medical-record"
import z from "zod"

/**
 * GET /api/medical-records/[visitId]
 * Get core medical record and visit info by visit ID
 * Related data (diagnoses, procedures, prescriptions) available via separate endpoints
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

      // Get medical record and visit info in parallel
      const [[record], [visitInfo]] = await Promise.all([
        db.select().from(medicalRecords).where(eq(medicalRecords.visitId, visitId)).limit(1),
        db.select().from(visits).where(eq(visits.id, visitId)).limit(1),
      ])

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

      const response: ResponseApi<MedicalRecordCoreData> = {
        message: "Medical record fetched successfully",
        data: {
          medicalRecord: record,
          visit: visitInfo,
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical record fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)

/**
 * Medical Record Schema
 */
const medicalRecordSchema = z.object({
  visitId: z.string().optional(),
  soapSubjective: z.string().optional(),
  soapObjective: z.string().optional(),
  soapAssessment: z.string().optional(),
  soapPlan: z.string().optional(),
  physicalExam: z.string().optional(),
  laboratoryResults: z.string().optional(),
  radiologyResults: z.string().optional(),
  isDraft: z.boolean().default(true),
})

/**
 * PATCH /api/medical-records/[visitId]
 * Update medical record by visit ID
 * Requires: medical_records:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params
      const body = await request.json()
      const validatedData = medicalRecordSchema.parse(body)

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

      // Get medical record by visitId
      const existing = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, visitId))
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
          message: "Cannot update locked medical record",
          status: HTTP_STATUS_CODES.FORBIDDEN,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.FORBIDDEN,
        })
      }

      // Update medical record
      const updatedRecord = await db
        .update(medicalRecords)
        .set(validatedData)
        .where(eq(medicalRecords.id, existing[0].id))
        .returning()

      const response: ResponseApi<MedicalRecord> = {
        message: "Medical record updated successfully",
        data: updatedRecord[0],
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical record update error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to update medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:write"] }
)
