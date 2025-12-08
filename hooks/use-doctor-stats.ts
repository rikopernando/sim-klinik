/**
 * Doctor Dashboard Stats Hook (H.3.3)
 * Fetch and manage doctor dashboard statistics
 */

import { useState, useEffect, useCallback } from "react"
import { getDoctorStats } from "@/lib/services/doctor-dashboard.service"
import { DoctorStats } from "@/types/dashboard"
import { getErrorMessage } from "@/lib/utils/error"

export interface UseDoctorStatsOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

export function useDoctorStats(options: UseDoctorStatsOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getDoctorStats()
      setStats(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Fetch stats error:", err)
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, autoRefresh, refreshInterval])

  return {
    stats,
    isLoading,
    error,
    lastRefresh,
    refresh: fetchStats,
  }
}
