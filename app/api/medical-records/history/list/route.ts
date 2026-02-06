/**
 * Medical Record History List API Endpoint
 * GET /api/medical-records/history/list - Get all medical records with filters and pagination
 * For browsing medical records across all patients
 * Requires: medical_records:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { medicalRecords, diagnoses, procedures } from "@/db/schema/medical-records"
import { prescriptions } from "@/db/schema/inventory"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { and, count, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export interface MedicalRecordHistoryListItem {
  id: string
  visitId: string
  visitNumber: string
  visitType: string
  recordType: string
  isLocked: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    mrNumber: string
    name: string
  }
  diagnosisCount: number
  procedureCount: number
  prescriptionCount: number
}

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Extract and parse query parameters
      const filters = {
        search: searchParams.get("search") || undefined,
        visitType: searchParams.get("visitType") || undefined,
        isLocked: searchParams.get("isLocked") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
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

      // Filter by visit type
      if (filters.visitType && filters.visitType !== "all") {
        conditions.push(eq(visits.visitType, filters.visitType))
      }

      // Filter by locked status
      if (filters.isLocked && filters.isLocked !== "all") {
        conditions.push(eq(medicalRecords.isLocked, filters.isLocked === "true"))
      }

      // Filter by date range (using medicalRecords.createdAt)
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        dateFrom.setHours(0, 0, 0, 0)
        conditions.push(gte(medicalRecords.createdAt, dateFrom))
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        conditions.push(lte(medicalRecords.createdAt, dateTo))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count for pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(medicalRecords)
        .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .where(whereClause)

      // Early return if no results
      if (total === 0) {
        const response: ResponseApi<MedicalRecordHistoryListItem[]> = {
          status: HTTP_STATUS_CODES.OK,
          message: "Medical record history list fetched successfully",
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

      // Fetch medical records with related data
      const results = await db
        .select({
          // Medical record fields
          id: medicalRecords.id,
          visitId: medicalRecords.visitId,
          recordType: medicalRecords.recordType,
          isLocked: medicalRecords.isLocked,
          isDraft: medicalRecords.isDraft,
          createdAt: medicalRecords.createdAt,
          updatedAt: medicalRecords.updatedAt,
          // Visit fields
          visitNumber: visits.visitNumber,
          visitType: visits.visitType,
          // Patient fields
          patientId: patients.id,
          patientName: patients.name,
          mrNumber: patients.mrNumber,
        })
        .from(medicalRecords)
        .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .where(whereClause)
        .orderBy(desc(medicalRecords.createdAt))
        .limit(limit)
        .offset(offset)

      // Get counts for each medical record
      const medicalRecordIds = results.map((r) => r.id)

      // Fetch counts in parallel
      const [diagnosisCounts, procedureCounts, prescriptionCounts] = await Promise.all([
        db
          .select({
            medicalRecordId: diagnoses.medicalRecordId,
            count: count(),
          })
          .from(diagnoses)
          .where(
            medicalRecordIds.length > 0
              ? or(...medicalRecordIds.map((id) => eq(diagnoses.medicalRecordId, id)))
              : undefined
          )
          .groupBy(diagnoses.medicalRecordId),
        db
          .select({
            medicalRecordId: procedures.medicalRecordId,
            count: count(),
          })
          .from(procedures)
          .where(
            medicalRecordIds.length > 0
              ? or(...medicalRecordIds.map((id) => eq(procedures.medicalRecordId, id)))
              : undefined
          )
          .groupBy(procedures.medicalRecordId),
        db
          .select({
            medicalRecordId: prescriptions.medicalRecordId,
            count: count(),
          })
          .from(prescriptions)
          .where(
            medicalRecordIds.length > 0
              ? or(...medicalRecordIds.map((id) => eq(prescriptions.medicalRecordId, id)))
              : undefined
          )
          .groupBy(prescriptions.medicalRecordId),
      ])

      // Create count maps
      const diagnosisCountMap = new Map(diagnosisCounts.map((d) => [d.medicalRecordId, d.count]))
      const procedureCountMap = new Map(procedureCounts.map((p) => [p.medicalRecordId, p.count]))
      const prescriptionCountMap = new Map(
        prescriptionCounts.map((p) => [p.medicalRecordId, p.count])
      )

      // Map results to response format
      const recordList: MedicalRecordHistoryListItem[] = results.map((result) => ({
        id: result.id,
        visitId: result.visitId,
        visitNumber: result.visitNumber,
        visitType: result.visitType,
        recordType: result.recordType,
        isLocked: result.isLocked,
        isDraft: result.isDraft,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        patient: {
          id: result.patientId,
          mrNumber: result.mrNumber,
          name: result.patientName,
        },
        diagnosisCount: diagnosisCountMap.get(result.id) || 0,
        procedureCount: procedureCountMap.get(result.id) || 0,
        prescriptionCount: prescriptionCountMap.get(result.id) || 0,
      }))

      const response: ResponseApi<MedicalRecordHistoryListItem[]> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Medical record history list fetched successfully",
        data: recordList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching medical record history list:", error)
      return NextResponse.json(
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Failed to fetch medical record history list",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
      )
    }
  },
  { permissions: ["medical_records:read"] }
)
