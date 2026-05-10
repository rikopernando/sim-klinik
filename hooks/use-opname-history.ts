"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import axios from "axios"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/error"
import type { ResponseApi, Pagination } from "@/types/api"
import type { OpnameHistoryItem } from "@/app/api/pharmacy/stok-opname/history/route"

export type DirectionFilter = "all" | "increase" | "decrease"

export function useOpnameHistory() {
  const [items, setItems] = useState<OpnameHistoryItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [direction, setDirection] = useState<DirectionFilter>("all")
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async (p: number, q: string, from: string, to: string) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setIsLoading(true)
    try {
      const res = await axios.get<ResponseApi<OpnameHistoryItem[]>>(
        "/api/pharmacy/stok-opname/history",
        {
          params: {
            page: p,
            limit: 20,
            search: q || undefined,
            dateFrom: from || undefined,
            dateTo: to || undefined,
          },
          signal: abortRef.current.signal,
        }
      )
      if (!abortRef.current?.signal.aborted) {
        setItems(res.data.data ?? [])
        if (res.data.pagination) setPagination(res.data.pagination)
      }
    } catch (err) {
      if (axios.isCancel(err)) return
      toast.error(getErrorMessage(err))
    } finally {
      if (!abortRef.current?.signal.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, debouncedSearch, dateFrom, dateTo)
    return () => abortRef.current?.abort()
  }, [load, page, debouncedSearch, dateFrom, dateTo])

  const displayItems = useMemo(() => {
    if (direction === "increase") return items.filter((i) => i.quantity > 0)
    if (direction === "decrease") return items.filter((i) => i.quantity < 0)
    return items
  }, [items, direction])

  const stats = useMemo(
    () => ({
      total: pagination.total,
      increased: items.filter((i) => i.quantity > 0).length,
      decreased: items.filter((i) => i.quantity < 0).length,
    }),
    [items, pagination.total]
  )

  const hasFilters = !!(search || dateFrom || dateTo)

  const clearFilters = () => {
    setSearch("")
    setDateFrom("")
    setDateTo("")
    setDirection("all")
    setPage(1)
  }

  const refresh = useCallback(
    () => load(page, debouncedSearch, dateFrom, dateTo),
    [load, page, debouncedSearch, dateFrom, dateTo]
  )

  return {
    // Data
    items,
    displayItems,
    pagination,
    stats,
    // State
    isLoading,
    page,
    search,
    dateFrom,
    dateTo,
    direction,
    hasFilters,
    // Setters
    setPage,
    setSearch,
    setDateFrom,
    setDateTo,
    setDirection,
    // Handlers
    refresh,
    clearFilters,
  }
}
