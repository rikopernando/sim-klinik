import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, patients } from "@/db/schema"
import { eq } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

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
        return NextResponse.json({ error: "Visit not found" }, { status: 404 })
      }

      // Update visit (only allow certain fields to be updated)
      const allowedFields = [
        "poliId", // Allow changing poli for outpatient visits
        "triageStatus",
        "chiefComplaint",
        "notes",
        "doctorId",
        "roomId",
        "disposition",
      ]
      const updateData: Record<string, unknown> = {}

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
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
