/**
 * Create Lab Result Hook
 * Handles lab result submission with validation and critical value detection
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { createLabResult } from "@/lib/services/lab.service"
import type { CreateLabResultInput } from "@/types/lab"
import { getErrorMessage } from "@/lib/utils/error"

interface UseCreateLabResultOptions {
  onSuccess?: (result: { id: string; criticalValue: boolean }) => void
  onError?: (error: Error) => void
}

interface UseCreateLabResultReturn {
  isCreating: boolean
  createResult: (data: CreateLabResultInput) => Promise<string | null>
}

export function useCreateLabResult(
  options: UseCreateLabResultOptions = {}
): UseCreateLabResultReturn {
  const { onSuccess, onError } = options
  const [isCreating, setIsCreating] = useState(false)

  const create = useCallback(
    async (data: CreateLabResultInput): Promise<string | null> => {
      setIsCreating(true)

      try {
        const result = await createLabResult(data)

        // Show warning if critical value detected
        if (result.criticalValue) {
          toast.warning("Nilai kritis terdeteksi! Notifikasi telah dikirim ke dokter.", {
            duration: 5000,
          })
        } else {
          toast.success("Hasil laboratorium berhasil disimpan")
        }

        onSuccess?.(result)
        return result.id
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
    createResult: create,
  }
}
