/**
 * useMaterials Hook
 * Manages medical materials/supplies tracking
 */

import { useState, useCallback } from "react"
import { MaterialUsage, MaterialUsageInput, APIResponse } from "@/types/inpatient"

interface UseMaterialsReturn {
  recordUsage: (data: MaterialUsageInput) => Promise<void>
  fetchUsage: (visitId: number) => Promise<{ materials: MaterialUsage[]; totalCost: string }>
  isSubmitting: boolean
  isFetching: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useMaterials(): UseMaterialsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Record material usage
   */
  const recordUsage = useCallback(async (data: MaterialUsageInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result: APIResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to record material usage")
      }

      setSuccess(true)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to record material usage"
      setError(errorMessage)
      console.error("Material usage recording error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  /**
   * Fetch material usage
   */
  const fetchUsage = useCallback(
    async (visitId: number): Promise<{ materials: MaterialUsage[]; totalCost: string }> => {
      setIsFetching(true)
      setError(null)

      try {
        const response = await fetch(`/api/materials?visitId=${visitId}`)
        const result: APIResponse<MaterialUsage[]> = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch material usage")
        }

        return {
          materials: result.data || [],
          totalCost: result.totalCost || "0",
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch material usage"
        setError(errorMessage)
        console.error("Material usage fetch error:", err)
        return { materials: [], totalCost: "0" }
      } finally {
        setIsFetching(false)
      }
    },
    []
  )

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
    recordUsage,
    fetchUsage,
    isSubmitting,
    isFetching,
    error,
    success,
    reset,
  }
}
