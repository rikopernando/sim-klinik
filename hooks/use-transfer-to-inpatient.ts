/**
 * useTransferToInpatient Hook
 * Handles patient transfer from outpatient to inpatient
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { transferToInpatient } from "@/lib/services/outpatient.service"

interface TransferData {
  visitId: string
  roomId: string
  bedNumber: string
  notes?: string
}

interface UseTransferToInpatientReturn {
  transfer: (data: TransferData) => Promise<boolean>
  isSubmitting: boolean
  reset: () => void
}

export function useTransferToInpatient(onSuccess?: () => void): UseTransferToInpatientReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const transfer = useCallback(
    async (data: TransferData): Promise<boolean> => {
      setIsSubmitting(true)

      try {
        // Validate required fields
        if (!data.roomId) {
          toast.error("Kamar wajib dipilih")
          return false
        }
        if (!data.bedNumber) {
          toast.error("Nomor bed wajib dipilih")
          return false
        }

        await transferToInpatient(data)

        toast.success("Transfer ke rawat inap berhasil!")

        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 1000)
        }

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Gagal melakukan transfer"
        toast.error(errorMessage)
        console.error("Transfer error:", err)
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess]
  )

  const reset = useCallback(() => {
    setIsSubmitting(false)
  }, [])

  return {
    transfer,
    isSubmitting,
    reset,
  }
}
