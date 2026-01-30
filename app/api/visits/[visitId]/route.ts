import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, patients } from "@/db/schema"
import { eq } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { editVisitApiSchema } from "@/lib/validations/edit-visit"
import {
  isValidStatusTransition,
  getStatusTransitionError,
  type VisitStatus,
} from "@/types/visit-status"

/**
 * GET /api/visits/[visitId]
 * Get a single visit by ID with patient data
 * Requires: visits:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, { params }: { params: { visitId: string } }) => {
    try {
      const { visitId } = params

      // Fetch visit with patient data
      const result = await db
        .select({
          // Visit fields
          id: visits.id,
          visitNumber: visits.visitNumber,
          visitType: visits.visitType,
          status: visits.status,
          triageStatus: visits.triageStatus,
          chiefComplaint: visits.chiefComplaint,
          disposition: visits.disposition,
          arrivalTime: visits.arrivalTime,
          startTime: visits.startTime,
          endTime: visits.endTime,
          queueNumber: visits.queueNumber,
          poliId: visits.poliId,
          doctorId: visits.doctorId,
          roomId: visits.roomId,
          notes: visits.notes,
          createdAt: visits.createdAt,
          updatedAt: visits.updatedAt,
          // Patient fields
          patient: {
            id: patients.id,
            name: patients.name,
            mrNumber: patients.mrNumber,
            nik: patients.nik,
            gender: patients.gender,
            dateOfBirth: patients.dateOfBirth,
            phone: patients.phone,
            address: patients.address,
          },
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(visits.id, visitId))
        .limit(1)

      if (result.length === 0 || !result[0]) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 })
      }

      return NextResponse.json(result[0], { status: 200 })
    } catch (error) {
      console.error("Visit fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch visit" }, { status: 500 })
    }
  },
  { permissions: ["visits:read"] }
)

/**
 * PATCH /api/visits/[visitId]
 * Update visit details
 * Requires: visits:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest, { params }: { params: { visitId: string } }) => {
    try {
      const { visitId } = params
      const body = await request.json()

      // Check if visit exists
      const [existingVisit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)

      if (!existingVisit) {
        const response: ResponseError<unknown> = {
          error: "Visit not found",
          message: "Visit not found",
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Validate request body with Zod schema
      const parsed = editVisitApiSchema.safeParse(body)
      if (!parsed.success) {
        const response: ResponseError<unknown> = {
          error: parsed.error.flatten(),
          message: "Validation failed",
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      const validatedData = parsed.data

      // Validate status transition if status is being changed
      if (validatedData.status && validatedData.status !== existingVisit.status) {
        const currentStatus = existingVisit.status as VisitStatus
        const newStatus = validatedData.status as VisitStatus
        if (!isValidStatusTransition(currentStatus, newStatus)) {
          const response: ResponseError<unknown> = {
            error: getStatusTransitionError(currentStatus, newStatus),
            message: getStatusTransitionError(currentStatus, newStatus),
            status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          }

          return NextResponse.json(response, {
            status: HTTP_STATUS_CODES.NOT_FOUND,
          })
        }
      }

      // Build update data from allowed fields
      const allowedFields = [
        "poliId",
        "triageStatus",
        "chiefComplaint",
        "notes",
        "doctorId",
        "roomId",
        "disposition",
        "status",
        "visitType",
        "arrivalTime",
      ]
      const updateData: Record<string, unknown> = {}

      for (const field of allowedFields) {
        const value = validatedData[field as keyof typeof validatedData]
        if (value !== undefined) {
          // Parse arrivalTime string to Date
          if (field === "arrivalTime" && typeof value === "string") {
            updateData[field] = new Date(value)
          } else {
            updateData[field] = value
          }
        }
      }

      // When changing visitType, clear fields that no longer apply
      if (validatedData.visitType && validatedData.visitType !== existingVisit.visitType) {
        if (validatedData.visitType !== "outpatient") {
          // Clear outpatient-specific fields
          if (!validatedData.poliId) updateData.poliId = null
          if (!validatedData.doctorId) updateData.doctorId = null
        }
        if (validatedData.visitType !== "emergency") {
          // Clear emergency-specific fields
          if (!validatedData.triageStatus) updateData.triageStatus = null
          if (!validatedData.chiefComplaint) updateData.chiefComplaint = null
        }
      }

      if (Object.keys(updateData).length === 0) {
        const response: ResponseError<unknown> = {
          error: "No valid fields to update",
          message: "No valid fields to update",
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      const [updatedVisit] = await db
        .update(visits)
        .set(updateData)
        .where(eq(visits.id, visitId))
        .returning()

      const response: ResponseApi<typeof updatedVisit> = {
        message: "Visit updated successfully",
        data: updatedVisit,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Visit update error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to update visit",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["visits:write"] }
)
