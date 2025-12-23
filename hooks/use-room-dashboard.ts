/**
 * Room Dashboard Hook
 * Fetches room data with occupancy information and auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from "react"
import type { RoomWithOccupancy } from "@/types/inpatient"
import { fetchAllRoomsWithOccupancy } from "@/lib/services/rooms.service"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/error"

interface UseRoomDashboardOptions {
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseRoomDashboardReturn {
  rooms: RoomWithOccupancy[]
  isLoading: boolean
  lastRefresh: Date | null
  refresh: () => Promise<void>
}

export function useRoomDashboard(options: UseRoomDashboardOptions = {}): UseRoomDashboardReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options

  const [rooms, setRooms] = useState<RoomWithOccupancy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Use ref to track the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchRooms = useCallback(async () => {
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
      const response = await fetchAllRoomsWithOccupancy()

      // Only update state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setRooms(response)
        setLastRefresh(new Date())
      }
    } catch (err) {
      // Only handle error if request wasn't aborted
      if (!abortController.signal.aborted) {
        console.error("Error fetching rooms:", err)
        toast.error(getErrorMessage(err))
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRooms()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRooms])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchRooms()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchRooms])

  return {
    rooms,
    isLoading,
    lastRefresh,
    refresh: fetchRooms,
  }
}
