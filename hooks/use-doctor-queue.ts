/**
 * Doctor Patient Queue Hook (H.3.3)
 * Fetch and manage doctor's patient queue
 */

import { useState, useEffect, useCallback } from "react"
import { getDoctorQueue } from "@/lib/services/doctor-dashboard.service"
import { QueueItem } from "@/types/dashboard"
import { getErrorMessage } from "@/lib/utils/error"

export interface UseDoctorQueueOptions {
  status?: "waiting" | "in_examination" | "all"
  date?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDoctorQueue(options: UseDoctorQueueOptions = {}) {
  const { status = "all", date, autoRefresh = false, refreshInterval = 30000 } = options

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Only pass status if it's not "all"
      const filterStatus = status !== "all" ? status : undefined
      const data = await getDoctorQueue(filterStatus, date)

      setQueue(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Fetch queue error:", err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [status, date])

  useEffect(() => {
    fetchQueue()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchQueue, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchQueue, autoRefresh, refreshInterval])

  return {
    queue,
    isLoading,
    error,
    lastRefresh,
    refresh: fetchQueue,
  }
}
