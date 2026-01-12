/**
 * Verify Lab Result Hook
 * Handles lab result verification by supervisors
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { verifyLabResult } from "@/lib/services/lab.service"
import { getErrorMessage } from "@/lib/utils/error"

interface UseVerifyLabResultOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseVerifyLabResultReturn {
  isVerifying: boolean
  verifyResult: (resultId: string, notes?: string) => Promise<boolean>
}

export function useVerifyLabResult(
  options: UseVerifyLabResultOptions = {}
): UseVerifyLabResultReturn {
  const { onSuccess, onError } = options
  const [isVerifying, setIsVerifying] = useState(false)

  const verify = useCallback(
    async (resultId: string, notes?: string): Promise<boolean> => {
      setIsVerifying(true)

      try {
        await verifyLabResult(resultId, notes)
        toast.success("Hasil laboratorium berhasil diverifikasi")
        onSuccess?.()
        return true
      } catch (error) {
        toast.error(getErrorMessage(error))
        onError?.(error as Error)
        return false
      } finally {
        setIsVerifying(false)
      }
    },
    [onSuccess, onError]
  )

  return {
    isVerifying,
    verifyResult: verify,
  }
}
