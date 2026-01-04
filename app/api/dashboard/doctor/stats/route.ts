import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, medicalRecords } from "@/db/schema"
import { eq, and, sql, gte } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import { DoctorStats } from "@/types/dashboard"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * GET /api/dashboard/doctor/stats
 * Get dashboard statistics for doctor
 * H.3.3: Doctor Dashboard Statistics
 * Requires: medical_records:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, { user }) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get today's visits assigned to this doctor
      const todayVisits = await db
        .select()
        .from(visits)
        .where(and(eq(visits.doctorId, user.id), gte(visits.arrivalTime, today)))

      // Count visits by status
      const waitingCount = todayVisits.filter(
        (v) => v.status === "registered" || v.status === "waiting"
      ).length

      const inProgressCount = todayVisits.filter((v) => v.status === "in_examination").length

      const completedCount = todayVisits.filter(
        (v) => v.status === "completed" || v.status === "ready_for_billing"
      ).length

      // Get unlocked medical records for this doctor
      const unlockedRecords = await db
        .select({
          id: medicalRecords.id,
          visitId: medicalRecords.visitId,
        })
        .from(medicalRecords)
        .where(and(eq(medicalRecords.authorId, user.id), eq(medicalRecords.isLocked, false)))

      // Get total patients seen (all time)
      const totalPatientsResult = await db
        .select({ count: sql<number>`count(distinct ${visits.patientId})` })
        .from(visits)
        .where(eq(visits.doctorId, user.id))

      const totalPatients = totalPatientsResult[0]?.count || 0

      const response: ResponseApi<DoctorStats> = {
        message: "Stats fetched successfully",
        data: {
          today: {
            total: todayVisits.length,
            waiting: waitingCount,
            inProgress: inProgressCount,
            completed: completedCount,
          },
          unlockedRecords: unlockedRecords.length,
          totalPatients: Number(totalPatients),
          lastUpdated: new Date().toISOString(),
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Doctor dashboard stats error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch doctor dashboard statistics",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
