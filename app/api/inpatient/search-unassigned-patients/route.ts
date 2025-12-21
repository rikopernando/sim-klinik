/**
 * Search Unassigned Patients API Endpoint
 * GET /api/inpatient/search-unassigned-patients
 * Searches for inpatient visits without bed assignments
 */

import { NextRequest, NextResponse } from "next/server"
import { eq, and, or, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { visits, patients, bedAssignments } from "@/db/schema"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

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

    const searchTerm = `%${query.trim()}%`

    // Find inpatient visits without active bed assignments
    const results = await db
      .select({
        id: patients.id,
        mrNumber: patients.mrNumber,
        name: patients.name,
        nik: patients.nik,
        visitId: visits.id,
        visitNumber: visits.visitNumber,
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .leftJoin(
        bedAssignments,
        and(eq(bedAssignments.visitId, visits.id), isNull(bedAssignments.dischargedAt))
      )
      .where(
        and(
          eq(visits.visitType, "inpatient"),
          or(
            // ILIKE is more efficient than LOWER() wrapping for case-insensitive search
            sql`${patients.name} ILIKE ${searchTerm}`,
            sql`${patients.mrNumber} ILIKE ${searchTerm}`
          ),
          // Visit must not have an active bed assignment
          isNull(bedAssignments.id)
        )
      )
      .limit(10)

    // Transform results
    const formattedResults = results.map((r) => ({
      id: r.id,
      mrNumber: r.mrNumber,
      name: r.name,
      nik: r.nik,
      visit: {
        id: r.visitId,
        visitNumber: r.visitNumber,
      },
    }))

    const response: ResponseApi<typeof formattedResults> = {
      data: formattedResults,
      message: "Patients fetched successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error searching unassigned patients:", error)

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to assign bed"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
