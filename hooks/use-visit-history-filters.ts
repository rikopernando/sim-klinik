/**
 * Visit History Filters Hook
 * Manages filter state for visit history list
 */

import { useState, useMemo } from "react"
import type { VisitHistoryFilters } from "@/types/visit-history"
import { useDebounce } from "./use-debounce"

const SEARCH_DEBOUNCE_DELAY = 500

export function useVisitHistoryFilters() {
  const [search, setSearch] = useState<string>("")
  const [status, setStatus] = useState<string>("all")
  const [visitType, setVisitType] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Debounce search input
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY)

  // Build filters object
  const filters: VisitHistoryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      visitType: visitType !== "all" ? visitType : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [debouncedSearch, status, visitType, dateFrom, dateTo]
  )

  const resetFilters = () => {
    setSearch("")
    setStatus("all")
    setVisitType("all")
    setDateFrom("")
    setDateTo("")
  }

  return {
    search,
    status,
    visitType,
    dateFrom,
    dateTo,
    setSearch,
    setStatus,
    setVisitType,
    setDateFrom,
    setDateTo,
    resetFilters,
    filters,
  }
}
