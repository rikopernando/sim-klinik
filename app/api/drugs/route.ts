/**
 * Drug Master CRUD API
 * Manages drug master data operations
 */

import { NextRequest, NextResponse } from "next/server"
import { getAllDrugsWithStock, searchDrugs } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * GET /api/drugs
 * Get all drugs with stock info or search by query
 * Query params:
 * - search: string (optional) - search by name or generic name
 * - id: string (optional) - get specific drug by ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    // Search drugs
    if (search && search.length >= 2) {
      const results = await searchDrugs(search)

      const response: ResponseApi<typeof results> = {
        data: results,
        message: "Drugs fetched successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    }

    // Get all drugs with stock
    const allDrugs = await getAllDrugsWithStock()

    const response: ResponseApi<typeof allDrugs> = {
      data: allDrugs,
      message: "Drugs fetched successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Drug fetch error:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch drugs",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
