import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/db"
import { medicalRecords, visits } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * Medical Record Schema
 */
const medicalRecordSchema = z.object({
  visitId: z.string(),
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
 * POST /api/medical-records
 * Create a new medical record
 * Requires: medical_records:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest, { user, role }) => {
    try {
      const body = await request.json()
      const validatedData = medicalRecordSchema.parse(body)

      // Verify visit exists and doesn't already have a medical record
      const visit = await db
        .select()
        .from(visits)
        .where(eq(visits.id, validatedData.visitId))
        .limit(1)

      if (visit.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Check if medical record already exists for this visit
      const existingRecord = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, validatedData.visitId))
        .limit(1)

      if (existingRecord.length > 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record already exists for this visit",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Determine author role from authenticated user's role, default to "doctor"
      const authorRole = role === "doctor" ? ("doctor" as const) : ("doctor" as const)

      // Create medical record with authenticated user as doctor
      const newRecord = await db
        .insert(medicalRecords)
        .values({
          visitId: validatedData.visitId,
          authorId: user.id,
          authorRole: authorRole,
          soapSubjective: validatedData.soapSubjective || null,
          soapObjective: validatedData.soapObjective || null,
          soapAssessment: validatedData.soapAssessment || null,
          soapPlan: validatedData.soapPlan || null,
          physicalExam: validatedData.physicalExam || null,
          laboratoryResults: validatedData.laboratoryResults || null,
          radiologyResults: validatedData.radiologyResults || null,
          isDraft: validatedData.isDraft,
          isLocked: false,
        })
        .returning()

      const response: ResponseApi<(typeof newRecord)[0]> = {
        message: "Medical record created successfully",
        data: newRecord[0],
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
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      console.error("Medical record creation error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to create medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:write"] }
)

/**
 * GET /api/medical-records?patientId=X
 * Get all medical records for a patient
 * For getting a specific medical record by visit ID, use: GET /api/medical-records/[visitId]
 * Requires: medical_records:read permission
 */
export const GET = withRBAC(
  async () => {
    try {
      // Get all medical records for a patient (via visits)
      const records = await db
        .select({
          medicalRecord: medicalRecords,
          visit: visits,
        })
        .from(medicalRecords)
        .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
        .orderBy(medicalRecords.createdAt)

      const response: ResponseApi<unknown> = {
        message: "Medical records fetched successfully",
        data: records,
        status: HTTP_STATUS_CODES.OK,
        meta: {
          page: 1,
          limit: records.length,
          total: records.length,
          hasMore: false,
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical records fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch medical records",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
