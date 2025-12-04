import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { patients } from "@/db/schema"
import { or, sql } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import { RegisteredPatient } from "@/types/registration"
import HTTP_STATUS_CODES from "@/lib/constans/http"

/**
 * GET /api/patients/search
 * Search for patients by NIK, MR Number, or Name
 * Query params:
 *   - q (search query, required)
 *   - page (page number, default: 1)
 *   - limit (results per page, default: 20, max: 100)
 * Requires: patients:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const query = searchParams.get("q")
      const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
      const offset = (page - 1) * limit

      if (!query || query.trim().length < 2) {
        const response: ResponseError<unknown> = {
          error: "Search query must be at least 2 characters",
          message: "Search query must be at least 2 characters",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      const searchQuery = query.trim()

      // Use start-of-string matching for NIK and MR Number (more efficient)
      // Use full wildcard for name search
      const startMatch = `${searchQuery}%`
      const fullMatch = `%${searchQuery}%`

      // Search by NIK, MR Number, or Name
      // Only select essential fields for search results to reduce data transfer
      const results = await db
        .select({
          id: patients.id,
          mrNumber: patients.mrNumber,
          nik: patients.nik,
          name: patients.name,
          dateOfBirth: patients.dateOfBirth,
          gender: patients.gender,
          phone: patients.phone,
          insuranceType: patients.insuranceType,
          bloodType: patients.bloodType,
        })
        .from(patients)
        .where(
          or(
            // ILIKE is more efficient than LOWER() wrapping for case-insensitive search
            sql`${patients.nik} ILIKE ${startMatch}`,
            sql`${patients.mrNumber} ILIKE ${startMatch}`,
            sql`${patients.name} ILIKE ${fullMatch}`
          )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(patients.name)

      // Map results to simplified search result format
      const mappedResults = results.map((patient) => ({
        id: patient.id,
        mrNumber: patient.mrNumber,
        nik: patient.nik ?? undefined,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
        gender: patient.gender ?? undefined,
        bloodType: patient.bloodType ?? undefined,
        phone: patient.phone ?? undefined,
        insuranceType: patient.insuranceType ?? undefined,
      }))

      const response: ResponseApi<Partial<RegisteredPatient>[]> = {
        message: "Patient search completed successfully",
        data: mappedResults,
        status: HTTP_STATUS_CODES.OK,
        meta: {
          page,
          limit,
          total: results.length,
          hasMore: results.length === limit,
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Patient search error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to search patients",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["patients:read"] }
)
