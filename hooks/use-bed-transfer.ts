/**
 * Bed Transfer Hook
 * Handles bed transfer logic and submission
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"

import { BedTransferInput } from "@/lib/inpatient/validation"
import { transferBed } from "@/lib/services/inpatient.service"

interface UseBedTransferOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseBedTransferReturn {
  isTransferring: boolean
  transfer: (data: BedTransferInput) => Promise<void>
}

export function useBedTransfer(options: UseBedTransferOptions = {}): UseBedTransferReturn {
  const { onSuccess, onError } = options
  const [isTransferring, setIsTransferring] = useState(false)

  const transfer = useCallback(
    async (data: BedTransferInput) => {
      setIsTransferring(true)

      try {
        await transferBed(data)
        toast.success("Bed berhasil ditransfer")
        onSuccess?.()
      } catch (error) {
        toast.error("Gagal transfer bed")
        onError?.(error as Error)
        console.error("Error transferring bed:", error)
      } finally {
        setIsTransferring(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isTransferring,
    transfer,
  }
}
