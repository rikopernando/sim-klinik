/**
 * useDischargeBilling Hook
 * Manages discharge billing operations for inpatient visits
 * Uses axios-based service layer for API calls
 */

import { toast } from "sonner"
import { useState, useCallback } from "react"

import { getDischargeBillingSummary, createDischargeBilling } from "@/lib/services/billing.service"
import type { DischargeBillingSummary } from "@/types/billing"
import { getErrorMessage } from "@/lib/utils/error"

interface UseDischargeBillingReturn {
  summary: DischargeBillingSummary | null
  fetchSummary: (visitId: string) => Promise<void>
  createBilling: (visitId: string) => Promise<void>
  isFetching: boolean
  isCreating: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useDischargeBilling(): UseDischargeBillingReturn {
  const [summary, setSummary] = useState<DischargeBillingSummary | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Fetch discharge billing summary
   */
  const fetchSummary = useCallback(async (visitId: string) => {
    setIsFetching(true)
    setError(null)

    try {
      const response = await getDischargeBillingSummary(visitId)
      setSummary(response)
    } catch (err) {
      toast.error(getErrorMessage(err))
      console.error("Discharge billing summary fetch error:", err)
    } finally {
      setIsFetching(false)
    }
  }, [])

  /**
   * Create discharge billing
   */
  const createBilling = useCallback(async (visitId: string) => {
    setIsCreating(true)
    setError(null)

    try {
      await createDischargeBilling(visitId)
      setSuccess(true)

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      toast.error(getErrorMessage(err))
      console.error("Discharge billing creation error:", err)
      throw err
    } finally {
      setIsCreating(false)
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsFetching(false)
    setIsCreating(false)
  }, [])

  return {
    summary,
    fetchSummary,
    createBilling,
    isFetching,
    isCreating,
    error,
    success,
    reset,
  }
}
