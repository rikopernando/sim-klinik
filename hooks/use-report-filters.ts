"use client"

import { useState, useMemo } from "react"
import type { PeriodPreset, ReportFilters } from "@/types/reports"

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

function getPrevDateRange(
  dateFrom: string,
  dateTo: string
): { prevDateFrom: string; prevDateTo: string } {
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1
  const prevTo = new Date(from)
  prevTo.setDate(prevTo.getDate() - 1)
  const prevFrom = new Date(prevTo)
  prevFrom.setDate(prevFrom.getDate() - days + 1)
  return { prevDateFrom: isoDate(prevFrom), prevDateTo: isoDate(prevTo) }
}

function getDateRange(preset: PeriodPreset): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  switch (preset) {
    case "today":
      return { dateFrom: today, dateTo: today }
    case "week": {
      const monday = new Date(now)
      monday.setDate(now.getDate() - now.getDay() + 1)
      return { dateFrom: monday.toISOString().split("T")[0], dateTo: today }
    }
    case "month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { dateFrom: firstDay.toISOString().split("T")[0], dateTo: today }
    }
    case "3months": {
      const threeMonthsAgo = new Date(now)
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      return { dateFrom: threeMonthsAgo.toISOString().split("T")[0], dateTo: today }
    }
    case "year": {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
      return { dateFrom: firstDayOfYear.toISOString().split("T")[0], dateTo: today }
    }
    default:
      return { dateFrom: today, dateTo: today }
  }
}

export function useReportFilters() {
  const [preset, setPresetState] = useState<PeriodPreset>("month")
  const defaultRange = getDateRange("month")
  const [customDateFrom, setCustomDateFrom] = useState(defaultRange.dateFrom)
  const [customDateTo, setCustomDateTo] = useState(defaultRange.dateTo)

  function setPreset(p: PeriodPreset) {
    setPresetState(p)
    if (p !== "custom") {
      const range = getDateRange(p)
      setCustomDateFrom(range.dateFrom)
      setCustomDateTo(range.dateTo)
    }
  }

  const filters: ReportFilters = useMemo(() => {
    const { dateFrom, dateTo } =
      preset === "custom"
        ? { dateFrom: customDateFrom, dateTo: customDateTo }
        : getDateRange(preset)
    const { prevDateFrom, prevDateTo } = getPrevDateRange(dateFrom, dateTo)
    return { dateFrom, dateTo, prevDateFrom, prevDateTo }
  }, [preset, customDateFrom, customDateTo])

  return {
    preset,
    setPreset,
    dateFrom: customDateFrom,
    dateTo: customDateTo,
    setDateFrom: setCustomDateFrom,
    setDateTo: setCustomDateTo,
    filters,
  }
}
