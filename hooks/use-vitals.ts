/**
 * useVitals Hook
 * Manages vital signs recording and retrieval
 */

import { useState, useCallback } from "react"
import { VitalSigns, VitalSignsInput, APIResponse } from "@/types/inpatient"

interface UseVitalsReturn {
  recordVitals: (data: VitalSignsInput) => Promise<void>
  fetchVitals: (visitId: string) => Promise<VitalSigns[]>
  isSubmitting: boolean
  isFetching: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useVitals(): UseVitalsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Record vital signs
   */
  const recordVitals = useCallback(async (data: VitalSignsInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result: APIResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to record vital signs")
      }

      setSuccess(true)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to record vital signs"
      setError(errorMessage)
      console.error("Vital signs recording error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  /**
   * Fetch vital signs history
   */
  const fetchVitals = useCallback(async (visitId: string): Promise<VitalSigns[]> => {
    setIsFetching(true)
    setError(null)

    try {
      const response = await fetch(`/api/vitals?visitId=${visitId}`)
      const result: APIResponse<VitalSigns[]> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch vital signs")
      }

      return result.data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch vital signs"
      setError(errorMessage)
      console.error("Vital signs fetch error:", err)
      return []
    } finally {
      setIsFetching(false)
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(false)
    setIsFetching(false)
  }, [])

  return {
    recordVitals,
    fetchVitals,
    isSubmitting,
    isFetching,
    error,
    success,
    reset,
  }
}
