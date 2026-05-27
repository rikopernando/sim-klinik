"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { getDoctorStats } from "@/lib/services/doctor-dashboard.service"
import { DoctorStats } from "@/types/dashboard"
import { getErrorMessage } from "@/lib/utils/error"

export interface UseDoctorStatsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDoctorStats(options: UseDoctorStatsOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const hasLoaded = useRef(false)

  const fetchStats = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    // Only show loading skeleton on the first fetch — background polls are silent
    if (!hasLoaded.current) setIsLoading(true)

    try {
      const data = await getDoctorStats(abortControllerRef.current.signal)
      if (abortControllerRef.current.signal.aborted) return
      setStats(data)
      setLastRefresh(new Date())
      setError(null)
      hasLoaded.current = true
    } catch (err) {
      if (axios.isCancel(err)) return
      console.error("Fetch stats error:", err)
      setError(getErrorMessage(err))
    } finally {
      if (!abortControllerRef.current.signal.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    let interval: ReturnType<typeof setInterval> | null = null
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(fetchStats, refreshInterval)
    }

    return () => {
      abortControllerRef.current?.abort()
      if (interval) clearInterval(interval)
    }
  }, [fetchStats, autoRefresh, refreshInterval])

  return { stats, isLoading, error, lastRefresh, refresh: fetchStats }
}
