/**
 * Medical Record History List Hook
 * Fetches and manages medical record history list
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import type {
  MedicalRecordHistoryListItem,
  MedicalRecordHistoryListFilters,
} from "@/types/medical-record"
import type { Pagination } from "@/types/api"
import { fetchMedicalRecordHistoryList } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useMedicalRecordHistoryList(filters?: MedicalRecordHistoryListFilters) {
  const [records, setRecords] = useState<MedicalRecordHistoryListItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadRecords = useCallback(
    async (page: number = 1) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsLoading(true)

      try {
        const { records: data, pagination: paginationInfo } = await fetchMedicalRecordHistoryList({
          filters,
          page,
          limit: DEFAULT_PAGINATION.limit,
        })

        if (!abortController.signal.aborted) {
          setRecords(data)
          setPagination(paginationInfo)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching medical record history list:", error)
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
    loadRecords()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadRecords])

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadRecords(newPage)
    },
    [loadRecords]
  )

  const refresh = useCallback(() => {
    loadRecords(pagination.page)
  }, [loadRecords, pagination.page])

  return {
    records,
    pagination,
    isLoading,
    handlePageChange,
    refresh,
  }
}
