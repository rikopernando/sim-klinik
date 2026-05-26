import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits } from "@/db/schema"
import { and, gte, lte, ne, sql } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { startOfDayWIB, endOfDayWIB, todayInWIB } from "@/lib/utils/date"

/**
 * GET /api/visits/counts?date=YYYY-MM-DD
 * Returns active visit counts per visitType for tab badges.
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const date = searchParams.get("date")

      const dateStr = date ?? todayInWIB()
      const dateConditions = [
        gte(visits.arrivalTime, startOfDayWIB(dateStr)),
        lte(visits.arrivalTime, endOfDayWIB(dateStr)),
        ne(visits.status, "cancelled"),
        ne(visits.status, "completed"),
      ]

      const rows = await db
        .select({
          visitType: visits.visitType,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(visits)
        .where(and(...dateConditions))
        .groupBy(visits.visitType)

      const counts: Record<string, number> = {
        outpatient: 0,
        emergency: 0,
        inpatient: 0,
      }
      for (const row of rows) {
        counts[row.visitType] = row.count
      }

      return NextResponse.json({ success: true, data: counts })
    } catch (error) {
      console.error("Visit counts fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch visit counts" }, { status: 500 })
    }
  },
  { permissions: ["visits:read"] }
)
