/**
 * Billing Queue Hook
 * Fetches visits ready for billing with auto-refresh
 */

import { useState, useEffect, useCallback } from "react"
import axios, { AxiosError } from "axios"
import type { PaymentStatus, APIResponse } from "@/types/billing"

interface Patient {
  id: string
  mrNumber: string
  name: string
  nik?: string | null
}

interface Visit {
  id: string
  visitNumber: string
  visitType: string
  status: string
  createdAt: Date | string
}

interface Billing {
  id: string
  totalAmount: string
  paidAmount: string
  remainingAmount: string
  paymentStatus: PaymentStatus
}

interface MedicalRecord {
  id: string
  isLocked: boolean
}

export interface BillingQueueItem {
  visit: Visit
  patient: Patient
  billing: Billing | null
  medicalRecord: MedicalRecord
}

interface UseBillingQueueOptions {
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseBillingQueueReturn {
  queue: BillingQueueItem[]
  isLoading: boolean
  error: string | null
  lastRefresh: Date | null
  refresh: () => void
}

export function useBillingQueue({
  autoRefresh = false,
  refreshInterval = 30000,
}: UseBillingQueueOptions = {}): UseBillingQueueReturn {
  const [queue, setQueue] = useState<BillingQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<APIResponse<BillingQueueItem[]>>("/api/billing/queue")

      if (response.data.success && response.data.data) {
        setQueue(response.data.data)
        setLastRefresh(new Date())
      } else {
        const errorMsg = response.data.error || "Failed to fetch billing queue"
        setError(errorMsg)
        console.error("Billing queue fetch error:", errorMsg)
      }
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.error || err.message
          : "Failed to fetch billing queue"

      console.error("Billing queue fetch error:", err)
      setError(errorMessage)
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
    error,
    lastRefresh,
    refresh,
  }
}
