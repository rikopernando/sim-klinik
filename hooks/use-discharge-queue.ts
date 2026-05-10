"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { toast } from "sonner"
import type { ResponseApi } from "@/types/api"
import type { VisitHistoryItem } from "@/types/visit-history"
import { getErrorMessage } from "@/lib/utils/error"

const POLL_INTERVAL = 30_000

export function useDischargeQueue() {
  const [visits, setVisits] = useState<VisitHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      const response = await axios.get<ResponseApi<VisitHistoryItem[]>>("/api/visits/history", {
        params: { status: "paid", limit: 100 },
        signal: abortControllerRef.current.signal,
      })
      if (!abortControllerRef.current?.signal.aborted) {
        setVisits(response.data.data ?? [])
      }
    } catch (error) {
      if (axios.isCancel(error)) return
      toast.error(getErrorMessage(error))
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, POLL_INTERVAL)
    return () => {
      abortControllerRef.current?.abort()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load])

  const removeVisit = useCallback((visitId: string) => {
    setVisits((prev) => prev.filter((v) => v.visit.id !== visitId))
  }, [])

  return { visits, isLoading, refresh: load, removeVisit }
}
