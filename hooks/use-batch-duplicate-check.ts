/**
 * Batch Duplicate Check Hook (Refactored)
 * Handles duplicate batch number validation with debouncing and request cancellation
 *
 * Features:
 * - Debounced API calls to reduce server load
 * - AbortController to cancel in-flight requests
 * - Error state management
 * - Memoized reset function to prevent unnecessary re-renders
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { checkDuplicateBatch } from "@/lib/services/inventory.service"
import { DuplicateBatchCheck } from "@/types/inventory"

interface UseBatchDuplicateCheckOptions {
  drugId: string
  batchNumber: string
  debounceMs?: number
}

interface UseBatchDuplicateCheckReturn {
  duplicateCheck: DuplicateBatchCheck | null
  isChecking: boolean
  isDuplicate: boolean
  error: string | null
  reset: () => void
}

export function useBatchDuplicateCheck({
  drugId,
  batchNumber,
  debounceMs = 500,
}: UseBatchDuplicateCheckOptions): UseBatchDuplicateCheckReturn {
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateBatchCheck | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoized reset function to prevent unnecessary re-renders
  const reset = useCallback(() => {
    setDuplicateCheck(null)
    setIsChecking(false)
    setError(null)

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  useEffect(() => {
    // Early return if required fields are missing
    if (!drugId || !batchNumber.trim()) {
      setDuplicateCheck(null)
      setError(null)
      return
    }

    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Debounce the API call to reduce server load
    const timeoutId = setTimeout(async () => {
      // Check if already aborted before starting
      if (abortController.signal.aborted) return

      setIsChecking(true)
      setError(null)

      try {
        const result = await checkDuplicateBatch(drugId, batchNumber.trim())

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setDuplicateCheck(result)
        }
      } catch (err) {
        // Only handle error if request wasn't aborted
        if (!abortController.signal.aborted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to check batch duplicate"
          console.error("Batch duplicate check error:", err)
          setError(errorMessage)
          setDuplicateCheck(null)
        }
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setIsChecking(false)
        }
      }
    }, debounceMs)

    // Cleanup function: abort request and clear timeout
    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [drugId, batchNumber, debounceMs])

  return {
    duplicateCheck,
    isChecking,
    isDuplicate: duplicateCheck?.exists ?? false,
    error,
    reset,
  }
}
