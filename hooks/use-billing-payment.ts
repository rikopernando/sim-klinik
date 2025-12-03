/**
 * Billing Payment Hook
 * Handles payment processing for billing
 */

import { useState, useCallback } from "react"
import axios from "axios"

interface ProcessPaymentParams {
  visitId: number
  amount: number
  paymentMethod: string
  paymentReference?: string
  amountReceived?: number // For cash payments
  notes?: string
}

interface ProcessPaymentResult {
  paymentStatus: string
  paidAmount: number
  remainingAmount: number
  changeGiven: number
}

export function useBillingPayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = useCallback(async (params: ProcessPaymentParams) => {
    try {
      setIsProcessing(true)
      setError(null)

      const response = await axios.post<{
        success: boolean
        data?: ProcessPaymentResult
        error?: string
      }>(`/api/billing/${params.visitId}/payment`, {
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        paymentReference: params.paymentReference,
        amountReceived: params.amountReceived,
        notes: params.notes,
      })

      if (response.data.success && response.data.data) {
        return {
          success: true,
          result: response.data.data,
        }
      } else {
        setError(response.data.error || "Failed to process payment")
        return { success: false }
      }
    } catch (err) {
      console.error("Process payment error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to process payment"
      setError(errorMessage)
      return { success: false }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    processPayment,
    isProcessing,
    error,
  }
}
