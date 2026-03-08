/**
 * Transaction History Hook
 * Fetches transaction history with filters and pagination
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { TransactionHistoryItem, TransactionHistoryFilters } from "@/types/transaction"
import type { Pagination } from "@/types/api"
import { fetchTransactionHistory } from "@/lib/services/billing.service"
import { getErrorMessage } from "@/lib/utils/error"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useTransactionHistory(filters?: TransactionHistoryFilters) {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadTransactions = useCallback(
    async (page: number = 1) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setIsLoading(true)

      try {
        const result = await fetchTransactionHistory({
          filters,
          page,
          limit: DEFAULT_PAGINATION.limit,
        })

        // Only update state if request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setTransactions(result.transactions)
          setPagination(result.pagination)
        }
      } catch (error) {
        // Don't show error for aborted requests
        if (error instanceof Error && error.name === "AbortError") {
          return
        }
        console.error("Error loading transaction history:", error)
        toast.error(getErrorMessage(error))
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [filters]
  )

  // Load transactions on mount and when filters change
  useEffect(() => {
    loadTransactions()

    // Cleanup: abort pending request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadTransactions])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      loadTransactions(page)
    },
    [loadTransactions]
  )

  // Refresh function
  const refresh = useCallback(() => {
    loadTransactions(pagination.page)
  }, [loadTransactions, pagination.page])

  return {
    transactions,
    pagination,
    isLoading,
    handlePageChange,
    refresh,
  }
}
