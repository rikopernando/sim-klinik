/**
 * useERQueue Hook
 * Manages ER queue data fetching and real-time updates
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { ERQueueItem, TriageStatistics } from "@/types/emergency"
import { sortByTriagePriority } from "@/lib/emergency/triage-utils"
import { getERQueue } from "@/lib/services/emergency.service"
import { ApiServiceError } from "@/lib/services/api.service"

interface UseERQueueOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
  status?: string // Filter by status ("all" fetches all statuses)
  search?: string // Client-side search filter (name, MR number, NIK)
}

interface UseERQueueReturn {
  queue: ERQueueItem[]
  sortedQueue: ERQueueItem[]
  statistics: TriageStatistics
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  fetchQueue: () => Promise<void>
  refresh: () => Promise<void>
}

export function useERQueue(options: UseERQueueOptions = {}): UseERQueueReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    status = "registered",
    search = "",
  } = options

  const [queue, setQueue] = useState<ERQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  /**
   * Fetch queue data from API
   */
  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // If status is "all", fetch without status filter, otherwise filter by status
      const data = await getERQueue(status === "all" ? undefined : status)

      setQueue(data)
      setLastRefresh(new Date())
    } catch (err) {
      if (err instanceof ApiServiceError) {
        setError(err.message)
      } else {
        setError("Gagal memuat antrian UGD")
      }
      console.error("ER Queue fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [status])

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchQueue()
  }, [fetchQueue])

  /**
   * Calculate statistics from queue (memoized for performance)
   */
  const statistics: TriageStatistics = useMemo(
    () => ({
      total: queue.length,
      red: queue.filter((item) => item.visit.triageStatus === "red").length,
      yellow: queue.filter((item) => item.visit.triageStatus === "yellow").length,
      green: queue.filter((item) => item.visit.triageStatus === "green").length,
      untriaged: queue.filter((item) => !item.visit.triageStatus).length,
    }),
    [queue]
  )

  /**
   * Filter queue by search term (client-side)
   */
  const filteredQueue = useMemo(() => {
    if (!search.trim()) return queue

    const searchLower = search.toLowerCase().trim()
    return queue.filter((item) => {
      const nameMatch = item.patient.name.toLowerCase().includes(searchLower)
      const mrMatch = item.patient.mrNumber.toLowerCase().includes(searchLower)
      const nikMatch = item.patient.nik?.toLowerCase().includes(searchLower)
      return nameMatch || mrMatch || nikMatch
    })
  }, [queue, search])

  /**
   * Sort queue by triage priority (memoized for performance)
   */
  const sortedQueue = useMemo(() => sortByTriagePriority(filteredQueue), [filteredQueue])

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchQueue()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchQueue])

  return {
    queue,
    sortedQueue,
    statistics,
    isLoading,
    error,
    lastRefresh,
    fetchQueue,
    refresh,
  }
}
