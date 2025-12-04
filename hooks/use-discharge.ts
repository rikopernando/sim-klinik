/**
 * Patient Discharge Hook
 * Handles discharge operations with billing gate
 */

import { useState, useCallback } from "react"
import type { DischargeSummaryInput } from "@/types/billing"

interface UseDischargeReturn {
  createDischargeSummary: (data: DischargeSummaryInput) => Promise<boolean>
  checkCanDischarge: (visitId: string) => Promise<any>
  isSubmitting: boolean
  isChecking: boolean
  error: string | null
  success: boolean
}

export function useDischarge(): UseDischargeReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createDischargeSummary = async (data: DischargeSummaryInput): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const response = await fetch("/api/billing/discharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create discharge summary")
      }

      setSuccess(true)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Discharge creation error:", err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkCanDischarge = useCallback(async (visitId: string): Promise<any> => {
    try {
      setIsChecking(true)
      setError(null)

      const response = await fetch(`/api/billing/discharge?visitId=${visitId}&check=true`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to check discharge status")
      }

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Discharge check error:", err)
      return null
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    createDischargeSummary,
    checkCanDischarge,
    isSubmitting,
    isChecking,
    error,
    success,
  }
}
