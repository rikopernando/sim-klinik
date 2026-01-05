/**
 * Discharge Summary API Endpoint
 * POST /api/inpatient/discharge-summary - Create discharge summary
 * GET /api/inpatient/discharge-summary?visitId={id} - Get discharge summary
 * Requires: inpatient:write permission (doctors only)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { dischargeSummaries } from "@/db/schema/billing"
import { dischargeSummarySchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/inpatient/discharge-summary
 * Create discharge summary and lock visit
 * Only doctors can create discharge summary
 */
export const POST = withRBAC(
  async (request: NextRequest, { user, role }) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = dischargeSummarySchema.parse(body)

      // Only doctors can create discharge summary
      if (role !== "doctor") {
        const response: ResponseError<unknown> = {
          error: "Unauthorized",
          message: "Hanya dokter yang dapat membuat ringkasan medis pulang",
          status: HTTP_STATUS_CODES.FORBIDDEN,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.FORBIDDEN })
      }

      // Check if visit exists and is inpatient
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
          message: "Ringkasan medis hanya untuk pasien rawat inap",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Check if visit is already locked (ready_for_billing)
      if (visit.status === "ready_for_billing") {
        const response: ResponseError<unknown> = {
          error: "Visit already locked",
          message: "Visit sudah terkunci. Gunakan fitur unlock untuk mengubah data",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Check if discharge summary already exists
      const [existingSummary] = await db
        .select()
        .from(dischargeSummaries)
        .where(eq(dischargeSummaries.visitId, validatedData.visitId))
        .limit(1)

      if (existingSummary) {
        const response: ResponseError<unknown> = {
          error: "Discharge summary already exists",
          message: "Ringkasan medis sudah ada untuk visit ini",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Create discharge summary and lock visit in transaction
      await db.transaction(async (tx) => {
        // Insert discharge summary
        await tx.insert(dischargeSummaries).values({
          visitId: validatedData.visitId,
          admissionDiagnosis: validatedData.admissionDiagnosis,
          dischargeDiagnosis: validatedData.dischargeDiagnosis,
          clinicalSummary: validatedData.clinicalSummary,
          proceduresPerformed: validatedData.proceduresPerformed || null,
          medicationsOnDischarge: validatedData.medicationsOnDischarge || null,
          dischargeInstructions: validatedData.dischargeInstructions,
          dietaryRestrictions: validatedData.dietaryRestrictions || null,
          activityRestrictions: validatedData.activityRestrictions || null,
          followUpDate: validatedData.followUpDate || null,
          followUpInstructions: validatedData.followUpInstructions || null,
          dischargedBy: user.id,
        })

        // Lock visit by setting status to ready_for_billing
        await tx
          .update(visits)
          .set({
            status: "ready_for_billing",
          })
          .where(eq(visits.id, validatedData.visitId))
      })

      const response: ResponseApi = {
        status: HTTP_STATUS_CODES.CREATED,
        message: "Discharge summary created successfully",
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      console.error("Error creating discharge summary:", error)

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

      // Handle business logic errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create discharge summary"
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
  { permissions: ["inpatient:write"] }
)
