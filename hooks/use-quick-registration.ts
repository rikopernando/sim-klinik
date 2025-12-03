/**
 * useQuickRegistration Hook
 * Handles quick ER registration logic
 */

import { useState, useCallback } from "react"
import { QuickRegistrationData, APIResponse } from "@/types/emergency"

interface UseQuickRegistrationReturn {
  register: (data: QuickRegistrationData) => Promise<void>
  isSubmitting: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useQuickRegistration(onSuccess?: (data: any) => void): UseQuickRegistrationReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Register patient in ER
   */
  const register = useCallback(
    async (data: QuickRegistrationData) => {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await fetch("/api/emergency/quick-register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result: APIResponse = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Gagal mendaftarkan pasien UGD")
        }

        setSuccess(true)

        if (onSuccess && result.data) {
          onSuccess(result.data)
        }

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
        setError(errorMessage)
        console.error("Quick registration error:", err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess]
  )

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(false)
  }, [])

  return {
    register,
    isSubmitting,
    error,
    success,
    reset,
  }
}
