import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { patients } from "@/db/schema"
import { or, like, sql } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import { RegisteredPatient } from "@/types/registration"
import HTTP_STATUS_CODES from "@/lib/constans/http"

/**
 * GET /api/patients/search
 * Search for patients by NIK, MR Number, or Name
 * Query params: q (search query)
 * Requires: patients:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const query = searchParams.get("q")

      if (!query || query.trim().length < 2) {
        const response: ResponseError<unknown> = {
          error: "Search query must be at least 2 characters",
          message: "Search query must be at least 2 characters",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        })
      }

      const searchTerm = `%${query.trim()}%`

      // Search by NIK, MR Number, or Name
      const results = await db
        .select({
          id: patients.id,
          mrNumber: patients.mrNumber,
          nik: patients.nik,
          name: patients.name,
          dateOfBirth: patients.dateOfBirth,
          gender: patients.gender,
          phone: patients.phone,
          address: patients.address,
          insuranceType: patients.insuranceType,
        })
        .from(patients)
        .where(
          or(
            like(patients.nik, searchTerm),
            like(patients.mrNumber, searchTerm),
            sql`LOWER(${patients.name}) LIKE LOWER(${searchTerm})`
          )
        )
        .limit(20) // Limit results for performance
        .orderBy(patients.name)

      const response: ResponseApi<RegisteredPatient[]> = {
        message: "Patient search completed successfully",
        data: results as RegisteredPatient[],
        status: HTTP_STATUS_CODES.OK,
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
