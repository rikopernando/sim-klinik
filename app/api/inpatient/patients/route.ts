/**
 * Inpatient Patients API Endpoint
 * GET /api/inpatient/patients - Get all active inpatient patients with filters
 * Requires: inpatient:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { bedAssignments } from "@/db/schema/inpatient"
import { rooms } from "@/db/schema/inpatient"
import { and, count, desc, eq } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import {
  buildInpatientWhereConditions,
  calculateDaysInHospital,
  fetchLatestVitalsForVisits,
} from "@/lib/inpatient/api-service"
import { ResponseApi } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Extract and parse query parameters
      const filters = {
        search: searchParams.get("search") || undefined,
        roomType: searchParams.get("roomType") || undefined,
        admissionDateFrom: searchParams.get("admissionDateFrom") || undefined,
        admissionDateTo: searchParams.get("admissionDateTo") || undefined,
      }

      const page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE))
      const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT))
      const offset = (page - 1) * limit

      // Build WHERE conditions using helper
      const conditions = buildInpatientWhereConditions(filters)

      // Get total count for pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .innerJoin(bedAssignments, eq(visits.id, bedAssignments.visitId))
        .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
        .where(and(...conditions))

      // Early return if no results
      if (total === 0) {
        const response: ResponseApi<Record<string, unknown>[]> = {
          status: HTTP_STATUS_CODES.OK,
          message: "Inpatient patients fetched successfully",
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
      }

      // Build base query
      const baseQuery = db
        .select({
          visitId: visits.id,
          visitNumber: visits.visitNumber,
          patientId: patients.id,
          mrNumber: patients.mrNumber,
          patientName: patients.name,
          admissionDate: visits.admissionDate,
          roomId: rooms.id,
          roomNumber: rooms.roomNumber,
          roomType: rooms.roomType,
          bedNumber: bedAssignments.bedNumber,
          assignmentId: bedAssignments.id,
        })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .innerJoin(bedAssignments, eq(visits.id, bedAssignments.visitId))
        .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
        .where(and(...conditions))
        .orderBy(desc(visits.admissionDate))

      // Apply pagination
      const results = await baseQuery.limit(limit).offset(offset)

      // Fetch latest vitals efficiently using helper
      const visitIds = results.map((r) => r.visitId)
      const vitalsMap = await fetchLatestVitalsForVisits(visitIds)

      // Map results with calculated fields
      const inpatientPatients = results.map((result) => ({
        visitId: result.visitId,
        visitNumber: result.visitNumber,
        patientId: result.patientId,
        mrNumber: result.mrNumber,
        patientName: result.patientName,
        admissionDate: result.admissionDate,
        daysInHospital: calculateDaysInHospital(new Date(result.admissionDate!)),
        roomId: result.roomId,
        roomNumber: result.roomNumber,
        roomType: result.roomType,
        bedNumber: result.bedNumber,
        assignmentId: result.assignmentId,
        latestVitals: vitalsMap.get(result.visitId) || null,
      }))

      const response: ResponseApi<typeof inpatientPatients> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Inpatient patients fetched successfully",
        data: inpatientPatients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching inpatient patients:", error)
      return NextResponse.json(
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Failed to fetch inpatient patients",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
      )
    }
  },
  { permissions: ["inpatient:read"] }
)
