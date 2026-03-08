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

  // Reset only drawer filters (not search which is inline)
  const resetFilters = () => {
    setStatus("all")
    setVisitType("all")
    setDateFrom("")
    setDateTo("")
  }

  // Count active filters in drawer only (excluding search which is inline)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (status !== "all") count++
    if (visitType !== "all") count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [status, visitType, dateFrom, dateTo])

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
    activeFilterCount,
    filters,
  }
}
