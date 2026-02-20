/**
 * Lab History Filters Hook
 * Manages filter state for lab order history
 */

import { useState, useMemo, useCallback } from "react"
import { useDebounce } from "./use-debounce"

export interface LabHistoryFilters {
  search?: string
  status?: string
  department?: string
  dateFrom?: string
  dateTo?: string
}

export function useLabHistoryFilters() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [department, setDepartment] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const debouncedSearch = useDebounce(search, 500)

  const filters = useMemo<LabHistoryFilters>(
    () => ({
      search: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      department: department !== "all" ? department : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [debouncedSearch, status, department, dateFrom, dateTo]
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (status !== "all") count++
    if (department !== "all") count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [status, department, dateFrom, dateTo])

  const resetFilters = useCallback(() => {
    setStatus("all")
    setDepartment("all")
    setDateFrom("")
    setDateTo("")
  }, [])

  return {
    search,
    setSearch,
    status,
    setStatus,
    department,
    setDepartment,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filters,
    activeFilterCount,
    resetFilters,
  }
}
