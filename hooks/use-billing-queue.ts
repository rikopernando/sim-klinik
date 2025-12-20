/**
 * Billing Queue Hook
 * Fetches visits ready for billing with auto-refresh
 */

import { useState, useEffect, useCallback } from "react"
import { getBillingQueue, type BillingQueueItem } from "@/lib/services/billing.service"
import { toast } from "sonner"

interface UseBillingQueueOptions {
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseBillingQueueReturn {
  queue: BillingQueueItem[]
  isLoading: boolean
  lastRefresh: Date | null
  refresh: () => void
}

export function useBillingQueue({
  autoRefresh = false,
  refreshInterval = 30000,
}: UseBillingQueueOptions = {}): UseBillingQueueReturn {
  const [queue, setQueue] = useState<BillingQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getBillingQueue()
      setQueue(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Billing queue fetch error:", err)
      toast.error("Failed to fetch billing queue")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchQueue, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchQueue])

  const refresh = useCallback(() => {
    fetchQueue()
  }, [fetchQueue])

  return {
    queue,
    isLoading,
    lastRefresh,
    refresh,
  }
}
