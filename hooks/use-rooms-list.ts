/**
 * Rooms List Hook
 * Fetches and manages rooms list with filters and pagination
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import type { Room, RoomFilters } from "@/types/rooms"
import { fetchRoomsPaginated } from "@/lib/services/rooms.service"
import { DEFAULT_PAGINATION_LIMIT } from "@/lib/constants/rooms"
import { Pagination } from "@/types/api"
import { getErrorMessage } from "@/lib/utils/error"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: DEFAULT_PAGINATION_LIMIT,
  total: 0,
  totalPages: 0,
}

export function useRoomsList(filters?: RoomFilters) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)

  // Use ref to track the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadRooms = useCallback(
    async (page: number = 1) => {
      // Abort any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Check if already aborted before starting
      if (abortController.signal.aborted) return

      try {
        setIsLoading(true)

        const { rooms: data, pagination: paginationInfo } = await fetchRoomsPaginated(
          filters,
          page,
          DEFAULT_PAGINATION_LIMIT
        )
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setRooms(data)
          setPagination(paginationInfo)
        }
      } catch (err) {
        // Only handle error if request wasn't aborted
        if (!abortController.signal.aborted) {
          toast.error(getErrorMessage(err))
          setRooms([])
        }
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [filters]
  )

  // Load rooms when filters change (reset to page 1)
  useEffect(() => {
    loadRooms(1)
  }, [loadRooms])

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      loadRooms(newPage)
    },
    [loadRooms]
  )

  // Refresh function for manual reload (current page)
  const refresh = useCallback(() => {
    loadRooms(pagination.page)
  }, [loadRooms, pagination.page])

  return {
    rooms,
    isLoading,
    pagination,
    handlePageChange,
    refresh,
  }
}
