/**
 * useDischargeBilling Hook
 * Manages discharge billing operations for inpatient visits
 * Uses axios-based service layer for API calls
 */

import { toast } from "sonner"
import { useState, useCallback } from "react"

import {
  getDischargeBillingSummary,
  completeInpatientDischarge,
  createDischargeBilling,
} from "@/lib/services/billing.service"
import type { DischargeBillingSummary } from "@/types/billing"
import { getErrorMessage } from "@/lib/utils/error"

interface UseDischargeBillingReturn {
  summary: DischargeBillingSummary | null
  fetchSummary: (visitId: string) => Promise<void>
  completeDischarge: (visitId: string) => Promise<void>
  createBilling: (
    visitId: string,
    billingAdjustment?: number,
    adjustmentNote?: string
  ) => Promise<void>
  isFetching: boolean
  isCompleting: boolean
  isCreating: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useDischargeBilling(): UseDischargeBillingReturn {
  const [summary, setSummary] = useState<DischargeBillingSummary | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
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
   * Complete inpatient discharge
   * Updates visit status to 'completed' - makes it appear in billing queue
   */
  const completeDischarge = useCallback(async (visitId: string) => {
    setIsCompleting(true)
    setError(null)

    try {
      await completeInpatientDischarge(visitId)
      setSuccess(true)

      toast.success("Rawat inap selesai", {
        description: "Pasien siap untuk proses pembayaran di kasir",
      })
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      toast.error(getErrorMessage(err))
      console.error("Complete discharge error:", err)
      throw err
    } finally {
      setIsCompleting(false)
    }
  }, [])

  /**
   * Create discharge billing
   * Creates billing AND updates visit status to ready_for_billing
   * This is called by clinical staff when completing inpatient treatment
   * Supports optional billing adjustments (discounts/surcharges)
   */
  const createBilling = useCallback(
    async (visitId: string, billingAdjustment?: number, adjustmentNote?: string) => {
      setIsCreating(true)
      setError(null)

      try {
        await createDischargeBilling(visitId, billingAdjustment, adjustmentNote)
        setSuccess(true)

        toast.success("Rawat inap selesai", {
          description: "Tagihan telah dibuat dan pasien siap untuk proses pembayaran di kasir",
        })

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
    },
    []
  )

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsFetching(false)
    setIsCompleting(false)
    setIsCreating(false)
  }, [])

  return {
    summary,
    fetchSummary,
    completeDischarge,
    createBilling,
    isFetching,
    isCompleting,
    isCreating,
    error,
    success,
    reset,
  }
}
