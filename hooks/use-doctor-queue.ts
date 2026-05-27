"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
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

  const abortControllerRef = useRef<AbortController | null>(null)
  const hasLoaded = useRef(false)

  const fetchQueue = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // Only show loading skeleton on the first fetch — background polls are silent
    if (!hasLoaded.current) setIsLoading(true)

    try {
      const filterStatus = status !== "all" ? status : undefined
      const data = await getDoctorQueue(filterStatus, date, abortControllerRef.current.signal)
      if (abortControllerRef.current.signal.aborted) return
      setQueue(data)
      setLastRefresh(new Date())
      setError(null)
      hasLoaded.current = true
    } catch (err) {
      if (axios.isCancel(err)) return
      console.error("Fetch queue error:", err)
      setError(getErrorMessage(err))
    } finally {
      if (!abortControllerRef.current.signal.aborted) setIsLoading(false)
    }
  }, [status, date])

  useEffect(() => {
    fetchQueue()

    let interval: ReturnType<typeof setInterval> | null = null
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(fetchQueue, refreshInterval)
    }

    return () => {
      abortControllerRef.current?.abort()
      if (interval) clearInterval(interval)
    }
  }, [fetchQueue, autoRefresh, refreshInterval])

  return { queue, isLoading, error, lastRefresh, refresh: fetchQueue }
}
