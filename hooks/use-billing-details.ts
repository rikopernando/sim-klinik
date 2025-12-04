/**
 * Billing Details Hook
 * Fetches billing details for a specific visit
 */

import { useState, useEffect, useCallback } from "react"
import axios, { AxiosError } from "axios"
import type { BillingItem, Payment, PaymentStatus, APIResponse } from "@/types/billing"

interface Billing {
  id: string
  visitId: string
  subtotal: string
  discount: string
  discountPercentage: string | null
  tax: string
  totalAmount: string
  insuranceCoverage: string
  patientPayable: string
  paymentStatus: PaymentStatus
  paidAmount: string
  remainingAmount: string
  paymentMethod: string | null
  paymentReference: string | null
  processedBy: string | null
  processedAt: Date | string | null
  notes: string | null
}

export interface BillingDetails {
  billing: Billing
  items: BillingItem[]
  payments: Payment[]
  patient: {
    name: string
    mrNumber: string
  }
  visit: {
    visitNumber: string
    createdAt: Date | string
  }
}

interface UseBillingDetailsReturn {
  billingDetails: BillingDetails | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useBillingDetails(visitId: string | null): UseBillingDetailsReturn {
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingDetails = useCallback(async () => {
    if (!visitId) {
      setBillingDetails(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<APIResponse<BillingDetails>>(`/api/billing/${visitId}`)

      if (response.data.success && response.data.data) {
        setBillingDetails(response.data.data)
      } else {
        const errorMsg = response.data.error || "Failed to fetch billing details"
        setError(errorMsg)
        console.error("Billing details fetch error:", errorMsg)
      }
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.error || err.message
          : "Failed to fetch billing details"

      console.error("Billing details fetch error:", err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [visitId])

  useEffect(() => {
    fetchBillingDetails()
  }, [fetchBillingDetails])

  const refresh = useCallback(() => {
    fetchBillingDetails()
  }, [fetchBillingDetails])

  return {
    billingDetails,
    isLoading,
    error,
    refresh,
  }
}
