/**
 * Lab History Hook
 * Fetches lab order history with filters and pagination
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { fetchLabOrders } from "@/lib/services/lab.service"
import { getErrorMessage } from "@/lib/utils/error"
import type { LabOrderWithRelations } from "@/types/lab"
import type { Pagination } from "@/types/api"
import type { LabHistoryFilters } from "./use-lab-history-filters"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useLabHistory(filters?: LabHistoryFilters) {
  const [orders, setOrders] = useState<LabOrderWithRelations[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadData = useCallback(
    async (page: number = 1) => {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)

      try {
        const result = await fetchLabOrders({
          status: filters?.status as import("@/types/lab").OrderStatus | undefined,
          department: filters?.department as "LAB" | "RAD" | undefined,
          dateFrom: filters?.dateFrom ? new Date(filters.dateFrom) : undefined,
          dateTo: filters?.dateTo ? new Date(filters.dateTo) : undefined,
          page,
          limit: 10,
        })

        setOrders(result.orders)
        setPagination(result.pagination)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        setOrders([])
        setPagination(DEFAULT_PAGINATION)
        toast.error(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    },
    [filters]
  )

  // Fetch on mount and when filters change
  useEffect(() => {
    loadData(1)
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadData])

  const handlePageChange = useCallback(
    (page: number) => {
      loadData(page)
    },
    [loadData]
  )

  const refresh = useCallback(() => {
    loadData(pagination.page)
  }, [loadData, pagination.page])

  return {
    orders,
    pagination,
    isLoading,
    handlePageChange,
    refresh,
  }
}
