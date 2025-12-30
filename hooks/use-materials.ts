/**
 * useMaterials Hook
 * Manages medical materials/supplies tracking
 * Uses axios-based service layer for API calls
 */

import { useState, useCallback } from "react"
import { MaterialUsage } from "@/types/inpatient"
import { fetchMaterialUsage, deleteMaterialUsage } from "@/lib/services/inpatient.service"
import { ApiServiceError } from "@/lib/services/api.service"

interface UseMaterialsReturn {
  fetchUsage: (visitId: string) => Promise<{ materials: MaterialUsage[]; totalCost: string }>
  deleteUsage: (materialId: string) => Promise<void>
  isFetching: boolean
  isDeleting: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useMaterials(): UseMaterialsReturn {
  const [isFetching, setIsFetching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Fetch material usage
   */
  const fetchUsage = useCallback(
    async (visitId: string): Promise<{ materials: MaterialUsage[]; totalCost: string }> => {
      setIsFetching(true)
      setError(null)

      try {
        const result = await fetchMaterialUsage(visitId)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof ApiServiceError ? err.message : "Failed to fetch material usage"
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
   * Delete material usage
   */
  const deleteUsage = useCallback(async (materialId: string) => {
    setIsDeleting(true)

    try {
      await deleteMaterialUsage(materialId)
      setSuccess(true)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Material usage delete error:", err)
      throw err
    } finally {
      setIsDeleting(false)
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsFetching(false)
    setIsDeleting(false)
  }, [])

  return {
    fetchUsage,
    deleteUsage,
    isFetching,
    isDeleting,
    error,
    success,
    reset,
  }
}
