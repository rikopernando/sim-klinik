/**
 * Inpatient Filters Hook
 * Manages filter state for inpatient patient list
 */

import { useState, useMemo } from "react"
import type { InpatientFilters } from "@/types/inpatient"
import { SEARCH_DEBOUNCE_DELAY } from "@/lib/constants/inpatient"

import { useDebounce } from "./use-debounce"

const DEFAULT_FILTERS: InpatientFilters = {
  search: "",
  roomType: "all",
  admissionDateFrom: "",
  admissionDateTo: "",
}

export function useInpatientFilters() {
  const [search, setSearch] = useState<string>(DEFAULT_FILTERS.search || "")
  const [roomType, setRoomType] = useState<string>(DEFAULT_FILTERS.roomType || "all")
  const [admissionDateFrom, setAdmissionDateFrom] = useState<string>(
    DEFAULT_FILTERS.admissionDateFrom || ""
  )
  const [admissionDateTo, setAdmissionDateTo] = useState<string>(
    DEFAULT_FILTERS.admissionDateTo || ""
  )

  // Debounce search input
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY)

  // Build filters object
  const filters: InpatientFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      roomType: roomType !== "all" ? roomType : undefined,
      admissionDateFrom: admissionDateFrom || undefined,
      admissionDateTo: admissionDateTo || undefined,
    }),
    [debouncedSearch, roomType, admissionDateFrom, admissionDateTo]
  )

  return {
    search,
    roomType,
    admissionDateFrom,
    admissionDateTo,
    setSearch,
    setRoomType,
    setAdmissionDateFrom,
    setAdmissionDateTo,
    filters,
  }
}
