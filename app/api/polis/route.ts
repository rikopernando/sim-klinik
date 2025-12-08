/**
 * Polis API Route
 * GET /api/polis - Get all active polis/departments
 */

import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { polis } from "@/db/schema/visits"
import { ResponseApi, ResponseError } from "@/types/api"
import { Poli } from "@/types/poli"
import HTTP_STATUS_CODES from "@/lib/constans/http"

export async function GET() {
  try {
    // Get all active polis, ordered by name
    const allPolis = await db
      .select({
        id: polis.id,
        name: polis.name,
        code: polis.code,
        description: polis.description,
        isActive: polis.isActive,
      })
      .from(polis)
      .where(eq(polis.isActive, "active"))
      .orderBy(polis.name)

    const response: ResponseApi<Poli[]> = {
      message: "Polis fetched successfully",
      data: allPolis,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching polis:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch polis data",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
