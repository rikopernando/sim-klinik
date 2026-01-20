import { NextRequest, NextResponse } from "next/server"
import { eq, and, or, asc } from "drizzle-orm"

import { db } from "@/db"
import { visits, patients, polis, medicalRecords } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import { QueueItem } from "@/types/dashboard"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * GET /api/dashboard/doctor/queue
 * Get patient queue for doctor (all poli)
 * H.3.3: Doctor Dashboard Patient Queue
 * Requires: visits:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const status = searchParams.get("status") // optional filter: waiting, in_examination, all

      // Build status filter
      let statusConditions
      if (status === "waiting") {
        statusConditions = or(eq(visits.status, "registered"), eq(visits.status, "waiting"))
      } else if (status === "in_examination") {
        statusConditions = eq(visits.status, "in_examination")
      } else {
        // Show all active visits (not completed/cancelled)
        statusConditions = and(
          eq(visits.doctorId, user.id),
          or(
            eq(visits.status, "registered"),
            eq(visits.status, "waiting"),
            eq(visits.status, "in_examination"),
            eq(visits.status, "ready_for_billing")
          )
        )
      }

      // Get patient queue with patient info, poli info, and medical record
      // Single query with LEFT JOIN to avoid N+1 problem
      // Sorted by queue number (ascending) - first arrival first
      const queueWithMedicalRecords = await db
        .select({
          visit: visits,
          patient: patients,
          poli: polis,
          medicalRecord: {
            id: medicalRecords.id,
            isLocked: medicalRecords.isLocked,
          },
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .leftJoin(polis, eq(visits.poliId, polis.id))
        .leftJoin(medicalRecords, eq(medicalRecords.visitId, visits.id))
        .where(and(eq(visits.doctorId, user.id), statusConditions))
        .orderBy(asc(visits.queueNumber))

      const response: ResponseApi<{
        queue: QueueItem[]
        total: number
      }> = {
        message: "Stats fetched successfully",
        data: {
          queue: queueWithMedicalRecords as QueueItem[],
          total: queueWithMedicalRecords.length,
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Doctor queue fetch error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch doctor patient queue",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["visits:read"] }
)
