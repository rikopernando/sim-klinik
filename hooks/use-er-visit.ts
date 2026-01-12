/**
 * Custom hook for ER visit data management
 * Handles fetching, updating, and error states for emergency visits
 */

import { useState, useEffect, useCallback } from "react"
import { getVisitById, updateVisit, type Visit, type UpdateVisitData } from "@/lib/services/visits.service"
import { ApiServiceError } from "@/lib/services/api.service"

interface UseERVisitReturn {
  visit: Visit | null
  isLoading: boolean
  error: string | null
  isEmergencyVisit: boolean
  refetch: () => Promise<void>
  updateVisit: (data: UpdateVisitData) => Promise<void>
}

interface UseERVisitOptions {
  visitId: string
  enabled?: boolean
}

/**
 * Hook for managing emergency visit data
 * @param options - Configuration options
 * @returns Visit data and management functions
 */
export function useERVisit({ visitId, enabled = true }: UseERVisitOptions): UseERVisitReturn {
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch visit data
  const fetchVisit = useCallback(async () => {
    if (!enabled || !visitId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await getVisitById(visitId)
      setVisit(data)
    } catch (err) {
      if (err instanceof ApiServiceError) {
        setError(err.message)
      } else {
        setError("Terjadi kesalahan saat memuat data kunjungan")
      }
      console.error("Error fetching ER visit:", err)
    } finally {
      setIsLoading(false)
    }
  }, [visitId, enabled])

  // Update visit data
  const handleUpdateVisit = useCallback(
    async (data: UpdateVisitData) => {
      if (!visitId) return

      try {
        setError(null)

        const updatedVisit = await updateVisit(visitId, data)

        // Update local state with new data
        setVisit(updatedVisit)

        // Refetch to ensure we have latest data
        await fetchVisit()
      } catch (err) {
        if (err instanceof ApiServiceError) {
          setError(err.message)
        } else {
          setError("Terjadi kesalahan saat memperbarui data kunjungan")
        }
        console.error("Error updating ER visit:", err)
        throw err
      }
    },
    [visitId, fetchVisit]
  )

  // Initial fetch
  useEffect(() => {
    fetchVisit()
  }, [fetchVisit])

  // Check if this is an emergency visit
  const isEmergencyVisit = visit?.visitType === "emergency"

  return {
    visit,
    isLoading,
    error,
    isEmergencyVisit,
    refetch: fetchVisit,
    updateVisit: handleUpdateVisit,
  }
}
