"use client"

import { useState, useMemo } from "react"
import type { PeriodPreset, ReportFilters } from "@/types/reports"

function wibDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
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
  return { prevDateFrom: wibDate(prevFrom), prevDateTo: wibDate(prevTo) }
}

function getDateRange(preset: PeriodPreset): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const today = wibDate(now)

  switch (preset) {
    case "today":
      return { dateFrom: today, dateTo: today }
    case "week": {
      const monday = new Date(now)
      monday.setDate(now.getDate() - now.getDay() + 1)
      return { dateFrom: wibDate(monday), dateTo: today }
    }
    case "month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { dateFrom: wibDate(firstDay), dateTo: today }
    }
    case "3months": {
      const threeMonthsAgo = new Date(now)
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      return { dateFrom: wibDate(threeMonthsAgo), dateTo: today }
    }
    case "year": {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)
      return { dateFrom: wibDate(firstDayOfYear), dateTo: today }
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
