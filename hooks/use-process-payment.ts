/**
 * Process Payment Hook
 * Handles the merged payment workflow (discount + payment)
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { processPaymentWithDiscount } from "@/lib/services/billing.service"
import type { ProcessPaymentData } from "@/types/billing"

interface UseProcessPaymentOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseProcessPaymentReturn {
  isProcessing: boolean
  processPayment: (data: ProcessPaymentData, billingId: string, receivedBy: string) => Promise<void>
}

/**
 * Hook to handle payment processing with discount
 *
 * @param options - Configuration options
 * @returns Payment processing state and function
 *
 * @example
 * ```tsx
 * const { isProcessing, processPayment } = useProcessPayment({
 *   onSuccess: () => {
 *     refreshQueue()
 *     fetchBillingDetails(visitId)
 *   }
 * })
 * ```
 */
export function useProcessPayment(options: UseProcessPaymentOptions = {}): UseProcessPaymentReturn {
  const { onSuccess, onError } = options
  const [isProcessing, setIsProcessing] = useState(false)

  const processPayment = useCallback(
    async (data: ProcessPaymentData, billingId: string, receivedBy: string) => {
      setIsProcessing(true)

      try {
        await processPaymentWithDiscount({
          billingId,
          discount: data.discount,
          discountPercentage: data.discountPercentage,
          insuranceCoverage: data.insuranceCoverage,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          amountReceived: data.amountReceived,
          paymentReference: data.paymentReference,
          receivedBy,
          notes: data.notes,
        })

        toast.success("Pembayaran berhasil diproses")

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        console.error("Process payment error:", error)
        toast.error("Terjadi kesalahan saat memproses pembayaran")

        if (onError && error instanceof Error) {
          onError(error)
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isProcessing,
    processPayment,
  }
}
