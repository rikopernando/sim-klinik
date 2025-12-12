/**
 * Expiring Drugs Hook
 * Fetches drugs that are expiring soon using service layer
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { getExpiringDrugs } from "@/lib/services/pharmacy.service"
import { ExpiringDrugsData } from "@/types/pharmacy"
import { getErrorMessage } from "@/lib/utils/error"

interface UseExpiringDrugsOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseExpiringDrugsReturn {
  expiringDrugs: ExpiringDrugsData
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  refresh: () => Promise<void>
}

export function useExpiringDrugs(options: UseExpiringDrugsOptions = {}): UseExpiringDrugsReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [expiringDrugs, setExpiringDrugs] = useState<ExpiringDrugsData>({
    all: [],
    expired: [],
    expiringSoon: [],
    warning: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true)

  const fetchExpiringDrugs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use service layer instead of direct fetch
      const data = await getExpiringDrugs()

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setExpiringDrugs(data)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setExpiringDrugs({ all: [], expired: [], expiringSoon: [], warning: [] })
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchExpiringDrugs()
  }, [fetchExpiringDrugs])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchExpiringDrugs()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchExpiringDrugs])

  // Track component mount status (handles React 18 Strict Mode double mount)
  useEffect(() => {
    isMountedRef.current = true // Set to true on mount
    return () => {
      isMountedRef.current = false // Set to false on unmount
    }
  }, [])

  return {
    expiringDrugs,
    isLoading,
    error,
    lastRefresh,
    refresh: fetchExpiringDrugs,
  }
}
