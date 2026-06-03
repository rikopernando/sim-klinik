/**
 * Pharmacy Queue Hook
 * Manages prescription queue with pagination, visit type filter, and auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { getPharmacyQueue } from "@/lib/services/pharmacy.service"
import { getErrorMessage } from "@/lib/utils/error"
import { PrescriptionQueueItem } from "@/types/pharmacy"
import { Pagination } from "@/types/api"

interface UsePharmacyQueueOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  page?: number
  visitType?: "outpatient" | "inpatient" | "emergency" | "all"
  limit?: number
}

interface UsePharmacyQueueReturn {
  queue: PrescriptionQueueItem[]
  pagination: Pagination
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  refresh: () => Promise<void>
}

const DEFAULT_PAGINATION: Pagination = { page: 1, limit: 10, total: 0, totalPages: 0 }

export function usePharmacyQueue(options: UsePharmacyQueueOptions = {}): UsePharmacyQueueReturn {
  const { autoRefresh = false, refreshInterval = 30000, page = 1, visitType, limit = 10 } = options

  const [queue, setQueue] = useState<PrescriptionQueueItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const isMountedRef = useRef(true)

  const fetchQueue = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getPharmacyQueue({
        page,
        limit,
        visitType: visitType === "all" ? undefined : visitType,
      })

      if (!isMountedRef.current) return

      setQueue(result.data)
      setPagination(result.pagination)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) return

      setError(getErrorMessage(err))
      setQueue([])
      setPagination(DEFAULT_PAGINATION)
    } finally {
      if (isMountedRef.current) setIsLoading(false)
    }
  }, [page, limit, visitType])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchQueue, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchQueue])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return { queue, pagination, isLoading, error, lastRefresh, refresh: fetchQueue }
}
