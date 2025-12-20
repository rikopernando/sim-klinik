/**
 * Custom hook for medical record history
 * Handles fetching patient's medical record history with optimized performance
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { getMedicalRecordHistory } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { MedicalRecordHistoryData } from "@/types/medical-record"

interface UseMedicalRecordHistoryOptions {
  patientId: string | null
  enabled?: boolean
}

interface UseMedicalRecordHistoryReturn {
  history: MedicalRecordHistoryData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing patient medical record history
 * @param patientId - Patient ID to fetch history for
 * @param enabled - Whether to auto-fetch on mount (default: true)
 */
export function useMedicalRecordHistory({
  patientId,
  enabled = true,
}: UseMedicalRecordHistoryOptions): UseMedicalRecordHistoryReturn {
  const [history, setHistory] = useState<MedicalRecordHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true)

  const fetchHistory = useCallback(async () => {
    if (!patientId) {
      setHistory(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use service layer instead of direct fetch
      const data = await getMedicalRecordHistory(patientId)

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setHistory(data)
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) return
      setHistory(null)
      setError(getErrorMessage(err))
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [patientId])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (enabled && patientId) {
      fetchHistory()
    }
  }, [enabled, patientId, fetchHistory])

  // Track component mount status (handles React 18 Strict Mode double mount)
  useEffect(() => {
    isMountedRef.current = true // Set to true on mount
    return () => {
      isMountedRef.current = false // Set to false on unmount
    }
  }, [])

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
  }
}
