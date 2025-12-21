/**
 * Available Rooms Hook
 * Fetches rooms with available beds for bed assignment
 */

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

import type { Room } from "@/types/inpatient"
import { fetchAvailabelRooms } from "@/lib/services/inpatient.service"

interface UseAvailableRoomsReturn {
  rooms: Room[]
  isLoading: boolean
  refresh: () => Promise<void>
}

export function useAvailableRooms(): UseAvailableRoomsReturn {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetchAvailabelRooms()
      setRooms(response)
    } catch (err) {
      setRooms([])
      console.error("Error fetching rooms:", err)
      toast.error("Gagal memuat data rooms")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    isLoading,
    refresh: fetchRooms,
  }
}
