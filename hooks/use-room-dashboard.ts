/**
 * Room Dashboard Hook
 * Fetches room data with occupancy information and auto-refresh
 */

import { useState, useEffect, useCallback } from "react"
import type { RoomWithOccupancy } from "@/types/inpatient"
import { fetchAllRoomsWithOccupancy } from "@/lib/services/room.service"
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

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetchAllRoomsWithOccupancy()
      setRooms(response)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Error fetching rooms:", err)
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRooms()
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
