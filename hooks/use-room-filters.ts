/**
 * Room Filters Hook
 * Manages filter state with debouncing for search
 */

import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import type { RoomFilters } from "@/types/rooms"
import { DEFAULT_ROOM_FILTERS, SEARCH_DEBOUNCE_DELAY } from "@/lib/constants/rooms"

export function useRoomFilters() {
  const [search, setSearch] = useState<string>(DEFAULT_ROOM_FILTERS.search)
  const [roomType, setRoomType] = useState<string>(DEFAULT_ROOM_FILTERS.roomType)
  const [building, setBuilding] = useState<string>("")

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY)

  // Build filters object with memoization
  const filters: RoomFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      roomType: roomType !== "all" ? roomType : undefined,
      isActive: DEFAULT_ROOM_FILTERS.isActive,
    }),
    [debouncedSearch, roomType]
  )

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => search !== "" || roomType !== "all", [search, roomType])

  // Clear all filters
  const clearFilters = () => {
    setSearch(DEFAULT_ROOM_FILTERS.search)
    setRoomType(DEFAULT_ROOM_FILTERS.roomType)
    setBuilding("")
  }

  return {
    // State values
    search,
    roomType,
    building,

    // Setters
    setSearch,
    setRoomType,
    setBuilding,

    // Computed values
    filters,
    hasActiveFilters,

    // Actions
    clearFilters,
  }
}
