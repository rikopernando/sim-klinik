/**
 * Doctor Patient Queue Hook (H.3.3)
 * Fetch and manage doctor's patient queue
 */

import { useState, useEffect, useCallback } from "react"

export interface QueuePatient {
  id: number
  name: string
}

export interface QueueVisit {
  id: number
  visitNumber: string
  visitType: string
  status: string
  queueNumber: number | null
}

export interface QueuePoli {
  name: string
}

export interface QueueMedicalRecord {
  id: number
  isLocked: boolean
}

export interface QueueItem {
  visit: QueueVisit
  patient: QueuePatient | null
  poli: QueuePoli | null
  medicalRecord: QueueMedicalRecord | null
}

export interface UseDoctorQueueOptions {
  status?: "waiting" | "in_examination" | "all"
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDoctorQueue(options: UseDoctorQueueOptions = {}) {
  const { status = "all", autoRefresh = false, refreshInterval = 30000 } = options

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (status !== "all") {
        params.append("status", status)
      }

      const response = await fetch(`/api/dashboard/doctor/queue?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch patient queue")
      }

      setQueue(data.data.queue)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Fetch queue error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [status])

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
