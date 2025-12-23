/**
 * Available Rooms Hook
 * Fetches rooms with available beds for bed assignment
 */

import { useState, useEffect, useCallback, useRef } from "react"
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
      const response = await fetchAvailabelRooms()

      // Only update state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setRooms(response)
      }
    } catch (err) {
      // Only handle error if request wasn't aborted
      if (!abortController.signal.aborted) {
        setRooms([])
        console.error("Error fetching rooms:", err)
        toast.error("Gagal memuat data rooms")
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchRooms()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchRooms])

  return {
    rooms,
    isLoading,
    refresh: fetchRooms,
  }
}
