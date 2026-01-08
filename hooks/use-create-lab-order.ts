/**
 * Create Lab Order Hook
 * Handles lab order creation with validation and error handling
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { createLabOrder } from "@/lib/services/lab.service"
import type { CreateLabOrderInput } from "@/types/lab"
import { getErrorMessage } from "@/lib/utils/error"

interface UseCreateLabOrderOptions {
  onSuccess?: (orderId: string) => void
  onError?: (error: Error) => void
}

interface UseCreateLabOrderReturn {
  isCreating: boolean
  createOrder: (data: CreateLabOrderInput) => Promise<string | null>
}

export function useCreateLabOrder(options: UseCreateLabOrderOptions = {}): UseCreateLabOrderReturn {
  const { onSuccess, onError } = options
  const [isCreating, setIsCreating] = useState(false)

  const create = useCallback(
    async (data: CreateLabOrderInput): Promise<string | null> => {
      setIsCreating(true)

      try {
        const orderId = await createLabOrder(data)
        toast.success("Order laboratorium berhasil dibuat")
        onSuccess?.(orderId)
        return orderId
      } catch (error) {
        toast.error(getErrorMessage(error))
        onError?.(error as Error)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isCreating,
    createOrder: create,
  }
}
