/**
 * Billing Hook
 * Manages billing operations and state
 */

import { useState, useCallback } from "react"
import axios from "axios"

interface CalculateBillingParams {
  visitId: string
  discount?: number
  discountPercentage?: number
  insuranceCoverage?: number
}

interface UseBillingReturn {
  calculateBilling: (params: CalculateBillingParams) => Promise<boolean>
  fetchBilling: (visitId: string) => Promise<any>
  isSubmitting: boolean
  isLoading: boolean
  error: string | null
  success: boolean
  billing: any | null
}

export function useBilling(): UseBillingReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [billing, setBilling] = useState<any | null>(null)

  const calculateBilling = async (params: CalculateBillingParams): Promise<boolean> => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const response = await axios.post(`/api/billing/${params.visitId}/calculate`, {
        discount: params.discount,
        discountPercentage: params.discountPercentage,
        insuranceCoverage: params.insuranceCoverage,
      })

      if (response.data.success) {
        // Fetch the updated billing details
        await fetchBilling(params.visitId)
        setSuccess(true)
        return true
      } else {
        setError(response.data.error || "Failed to calculate billing")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Billing calculation error:", err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchBilling = useCallback(async (visitId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get(`/api/billing/${visitId}`)

      if (response.data.success) {
        setBilling(response.data.data)
        return response.data.data
      } else {
        setError(response.data.error || "Failed to fetch billing")
        return null
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setBilling(null)
        return null
      }
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      console.error("Billing fetch error:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    calculateBilling,
    fetchBilling,
    isSubmitting,
    isLoading,
    error,
    success,
    billing,
  }
}
