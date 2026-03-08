/**
 * Medical Record History List Filters Hook
 * Manages filter state for medical record history list
 */

import { useState, useMemo } from "react"
import type { MedicalRecordHistoryListFilters } from "@/types/medical-record"
import { useDebounce } from "./use-debounce"

const SEARCH_DEBOUNCE_DELAY = 500

export function useMedicalRecordHistoryListFilters() {
  const [search, setSearch] = useState<string>("")
  const [visitType, setVisitType] = useState<string>("all")
  const [isLocked, setIsLocked] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Debounce search input
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY)

  // Build filters object
  const filters: MedicalRecordHistoryListFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      visitType: visitType !== "all" ? visitType : undefined,
      isLocked: isLocked !== "all" ? isLocked : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [debouncedSearch, visitType, isLocked, dateFrom, dateTo]
  )

  // Reset only drawer filters (not search which is inline)
  const resetFilters = () => {
    setVisitType("all")
    setIsLocked("all")
    setDateFrom("")
    setDateTo("")
  }

  // Count active filters in drawer only (excluding search which is inline)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (visitType !== "all") count++
    if (isLocked !== "all") count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [visitType, isLocked, dateFrom, dateTo])

  return {
    search,
    visitType,
    isLocked,
    dateFrom,
    dateTo,
    setSearch,
    setVisitType,
    setIsLocked,
    setDateFrom,
    setDateTo,
    resetFilters,
    activeFilterCount,
    filters,
  }
}
