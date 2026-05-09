import axios from "axios"
import type { ResponseApi } from "@/types/api"
import type { FinancialReportData, ReportFilters } from "@/types/reports"
import { ApiServiceError, handleApiError } from "./api.service"

export async function fetchFinancialReport(filters: ReportFilters): Promise<FinancialReportData> {
  try {
    const params = new URLSearchParams({ dateFrom: filters.dateFrom, dateTo: filters.dateTo })
    if (filters.prevDateFrom) params.set("prevDateFrom", filters.prevDateFrom)
    if (filters.prevDateTo) params.set("prevDateTo", filters.prevDateTo)
    const response = await axios.get<ResponseApi<FinancialReportData>>(
      `/api/reports/financial?${params}`
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}
