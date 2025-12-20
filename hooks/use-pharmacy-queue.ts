/**
 * Pharmacy Queue Hook
 * Manages prescription queue with auto-refresh using service layer
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { getPharmacyQueue } from "@/lib/services/pharmacy.service"
import { getErrorMessage } from "@/lib/utils/error"
import { PrescriptionQueueItem } from "@/types/pharmacy"

interface UsePharmacyQueueOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UsePharmacyQueueReturn {
  queue: PrescriptionQueueItem[]
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  refresh: () => Promise<void>
}

export function usePharmacyQueue(options: UsePharmacyQueueOptions = {}): UsePharmacyQueueReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options

  const [queue, setQueue] = useState<PrescriptionQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true)

  const fetchQueue = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use service layer
      const data = await getPharmacyQueue()

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setQueue(data)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setQueue([])
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchQueue()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchQueue])

  // Track component mount status (handles React 18 Strict Mode double mount)
  useEffect(() => {
    isMountedRef.current = true // Set to true on mount
    return () => {
      isMountedRef.current = false // Set to false on unmount
    }
  }, [])

  return {
    queue,
    isLoading,
    error,
    lastRefresh,
    refresh: fetchQueue,
  }
}
