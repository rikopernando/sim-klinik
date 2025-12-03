/**
 * Polis API Route
 * GET /api/polis - Get all active polis/departments
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { polis } from "@/db/schema/visits"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      data: allPolis,
    })
  } catch (error) {
    console.error("Error fetching polis:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch polis data",
      },
      { status: 500 }
    )
  }
}
