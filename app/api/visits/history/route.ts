/**
 * Visit History API Endpoint
 * GET /api/visits/history - Get all visits with filters and pagination
 * Includes completed and cancelled visits (unlike queue endpoint)
 * Requires: visits:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, polis } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { and, count, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"
import { VisitHistoryItem } from "@/types/visit-history"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Extract and parse query parameters
      const filters = {
        search: searchParams.get("search") || undefined,
        status: searchParams.get("status") || undefined,
        visitType: searchParams.get("visitType") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
        poliId: searchParams.get("poliId") || undefined,
        doctorId: searchParams.get("doctorId") || undefined,
        patientId: searchParams.get("patientId") || undefined,
      }

      const page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE))
      const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT))
      const offset = (page - 1) * limit

      // Build WHERE conditions
      const conditions: SQL[] = []

      // Search by patient name, MR number, or visit number
      if (filters.search) {
        conditions.push(
          or(
            ilike(patients.name, `%${filters.search}%`),
            ilike(patients.mrNumber, `%${filters.search}%`),
            ilike(visits.visitNumber, `%${filters.search}%`)
          )!
        )
      }

      // Filter by status
      if (filters.status && filters.status !== "all") {
        conditions.push(eq(visits.status, filters.status))
      }

      // Filter by visit type
      if (filters.visitType && filters.visitType !== "all") {
        conditions.push(eq(visits.visitType, filters.visitType))
      }

      // Filter by date range (using arrivalTime)
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        dateFrom.setHours(0, 0, 0, 0)
        conditions.push(gte(visits.arrivalTime, dateFrom))
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        conditions.push(lte(visits.arrivalTime, dateTo))
      }

      // Filter by poli
      if (filters.poliId) {
        conditions.push(eq(visits.poliId, filters.poliId))
      }

      // Filter by doctor
      if (filters.doctorId) {
        conditions.push(eq(visits.doctorId, filters.doctorId))
      }

      // Filter by patient
      if (filters.patientId) {
        conditions.push(eq(visits.patientId, filters.patientId))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count for pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .leftJoin(polis, eq(visits.poliId, polis.id))
        .leftJoin(user, eq(visits.doctorId, user.id))
        .where(whereClause)

      // Early return if no results
      if (total === 0) {
        const response: ResponseApi<VisitHistoryItem[]> = {
          status: HTTP_STATUS_CODES.OK,
          message: "Visit history fetched successfully",
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

      // Fetch visits with related data
      const results = await db
        .select({
          // Visit fields
          visitId: visits.id,
          visitNumber: visits.visitNumber,
          visitType: visits.visitType,
          status: visits.status,
          arrivalTime: visits.arrivalTime,
          startTime: visits.startTime,
          endTime: visits.endTime,
          queueNumber: visits.queueNumber,
          triageStatus: visits.triageStatus,
          chiefComplaint: visits.chiefComplaint,
          notes: visits.notes,
          disposition: visits.disposition,
          createdAt: visits.createdAt,
          updatedAt: visits.updatedAt,
          // Patient fields
          patientId: patients.id,
          patientName: patients.name,
          mrNumber: patients.mrNumber,
          gender: patients.gender,
          dateOfBirth: patients.dateOfBirth,
          // Poli fields
          poliId: polis.id,
          poliName: polis.name,
          poliCode: polis.code,
          // Doctor fields
          doctorId: user.id,
          doctorName: user.name,
        })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .leftJoin(polis, eq(visits.poliId, polis.id))
        .leftJoin(user, eq(visits.doctorId, user.id))
        .where(whereClause)
        .orderBy(desc(visits.arrivalTime))
        .limit(limit)
        .offset(offset)

      // Map results to VisitHistoryItem format
      const visitHistory: VisitHistoryItem[] = results.map((result) => ({
        visit: {
          id: result.visitId,
          visitNumber: result.visitNumber,
          visitType: result.visitType,
          status: result.status as VisitHistoryItem["visit"]["status"],
          arrivalTime: result.arrivalTime.toISOString(),
          startTime: result.startTime?.toISOString() || null,
          endTime: result.endTime?.toISOString() || null,
          queueNumber: result.queueNumber,
          triageStatus: result.triageStatus,
          chiefComplaint: result.chiefComplaint,
          notes: result.notes,
          disposition: result.disposition,
          createdAt: result.createdAt.toISOString(),
          updatedAt: result.updatedAt.toISOString(),
        },
        patient: {
          id: result.patientId,
          mrNumber: result.mrNumber,
          name: result.patientName,
          gender: result.gender,
          dateOfBirth: result.dateOfBirth?.toISOString() || null,
        },
        poli: result.poliId
          ? {
              id: result.poliId,
              name: result.poliName!,
              code: result.poliCode!,
            }
          : null,
        doctor: result.doctorId
          ? {
              id: result.doctorId,
              name: result.doctorName!,
            }
          : null,
      }))

      const response: ResponseApi<VisitHistoryItem[]> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Visit history fetched successfully",
        data: visitHistory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching visit history:", error)
      return NextResponse.json(
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Failed to fetch visit history",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
      )
    }
  },
  { permissions: ["visits:read"] }
)
