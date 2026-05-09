"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { fetchFinancialReport } from "@/lib/services/reports.service"
import { getErrorMessage } from "@/lib/utils/error"
import type { FinancialReportData, ReportFilters } from "@/types/reports"

export function useFinancialReport(filters: ReportFilters) {
  const [data, setData] = useState<FinancialReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      const result = await fetchFinancialReport(filters)
      if (!abortControllerRef.current?.signal.aborted) {
        setData(result)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      toast.error(getErrorMessage(error))
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [filters])

  useEffect(() => {
    load()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [load])

  return { data, isLoading, refresh: load }
}
