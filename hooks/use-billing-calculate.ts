/**
 * Billing Calculate Hook
 * Handles billing calculation with discount and insurance
 */

import { useState, useCallback } from "react"
import axios from "axios"

interface CalculateBillingParams {
  visitId: string
  discount?: number
  discountPercentage?: number
  insuranceCoverage?: number
}

export function useBillingCalculate() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateBilling = useCallback(async (params: CalculateBillingParams) => {
    try {
      setIsCalculating(true)
      setError(null)

      const response = await axios.post(`/api/billing/${params.visitId}/calculate`, {
        discount: params.discount,
        discountPercentage: params.discountPercentage,
        insuranceCoverage: params.insuranceCoverage,
      })

      if (response.data.success) {
        return {
          success: true,
          billingId: response.data.data.billingId,
        }
      } else {
        setError(response.data.error || "Failed to calculate billing")
        return { success: false }
      }
    } catch (err) {
      console.error("Calculate billing error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to calculate billing"
      setError(errorMessage)
      return { success: false }
    } finally {
      setIsCalculating(false)
    }
  }, [])

  return {
    calculateBilling,
    isCalculating,
    error,
  }
}
