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

  const resetFilters = () => {
    setSearch("")
    setVisitType("all")
    setIsLocked("all")
    setDateFrom("")
    setDateTo("")
  }

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
    filters,
  }
}
