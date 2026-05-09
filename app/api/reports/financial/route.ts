import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import { getFinancialReport } from "@/lib/reports/financial-report"
import { ApiCache } from "@/lib/cache/api-cache"
import type { ResponseApi, ResponseError } from "@/types/api"
import type { FinancialReportData } from "@/types/reports"
import HTTP_STATUS_CODES from "@/lib/constants/http"

const cache = new ApiCache<FinancialReportData>(60_000)

function getDefaultDateRange() {
  const now = new Date()
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const dateTo = now.toISOString().split("T")[0]
  return { dateFrom, dateTo }
}

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const defaults = getDefaultDateRange()
      const dateFrom = searchParams.get("dateFrom") || defaults.dateFrom
      const dateTo = searchParams.get("dateTo") || defaults.dateTo

      const prevDateFrom = searchParams.get("prevDateFrom") ?? undefined
      const prevDateTo = searchParams.get("prevDateTo") ?? undefined

      const cacheKey = `financial-report:${dateFrom}:${dateTo}:${prevDateFrom ?? ""}:${prevDateTo ?? ""}`
      const cached = cache.get(cacheKey)
      if (cached) {
        const response: ResponseApi<FinancialReportData> = {
          data: cached,
          message: "Financial report fetched successfully",
          status: HTTP_STATUS_CODES.OK,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
      }

      const data = await getFinancialReport(dateFrom, dateTo, prevDateFrom, prevDateTo)
      cache.set(cacheKey, data)

      const response: ResponseApi<FinancialReportData> = {
        data,
        message: "Financial report fetched successfully",
        status: HTTP_STATUS_CODES.OK,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Financial report error:", error)
      const response: ResponseError<unknown> = {
        error: error,
        message: "Failed to fetch financial report",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["system:reports"] }
)
