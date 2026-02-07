/**
 * Visit History Hook
 * Fetches and manages visit history list
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import type { VisitHistoryItem, VisitHistoryFilters } from "@/types/visit-history"
import type { Pagination } from "@/types/api"
import { fetchVisitHistory } from "@/lib/services/visit.service"
import { getErrorMessage } from "@/lib/utils/error"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useVisitHistory(filters?: VisitHistoryFilters) {
  const [visits, setVisits] = useState<VisitHistoryItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadVisits = useCallback(
    async (page: number = 1) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsLoading(true)

      try {
        const { visits: data, pagination: paginationInfo } = await fetchVisitHistory({
          filters,
          page,
          limit: DEFAULT_PAGINATION.limit,
        })

        if (!abortController.signal.aborted) {
          setVisits(data)
          setPagination(paginationInfo)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching visit history:", error)
          toast.error(getErrorMessage(error))
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [filters]
  )

  useEffect(() => {
    loadVisits()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadVisits])

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadVisits(newPage)
    },
    [loadVisits]
  )

  const refresh = useCallback(() => {
    loadVisits(pagination.page)
  }, [loadVisits, pagination.page])

  return {
    visits,
    pagination,
    isLoading,
    handlePageChange,
    refresh,
  }
}
