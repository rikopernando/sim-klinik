/**
 * Update Lab Order Status Hook
 * Handles lab order status transitions with validation
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { updateLabOrderStatus } from "@/lib/services/lab.service"
import type { UpdateLabOrderStatusInput } from "@/types/lab"
import { getErrorMessage } from "@/lib/utils/error"

interface UseUpdateLabOrderStatusOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseUpdateLabOrderStatusReturn {
  isUpdating: boolean
  updateStatus: (orderId: string, data: UpdateLabOrderStatusInput) => Promise<boolean>
}

export function useUpdateLabOrderStatus(
  options: UseUpdateLabOrderStatusOptions = {}
): UseUpdateLabOrderStatusReturn {
  const { onSuccess, onError } = options
  const [isUpdating, setIsUpdating] = useState(false)

  const update = useCallback(
    async (orderId: string, data: UpdateLabOrderStatusInput): Promise<boolean> => {
      setIsUpdating(true)

      try {
        await updateLabOrderStatus(orderId, data)
        toast.success("Status order berhasil diupdate")
        onSuccess?.()
        return true
      } catch (error) {
        toast.error(getErrorMessage(error))
        onError?.(error as Error)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isUpdating,
    updateStatus: update,
  }
}
