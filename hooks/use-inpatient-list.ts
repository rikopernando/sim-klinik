/**
 * Inpatient List Hook
 * Fetches and manages inpatient patient list
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import type { InpatientPatient, InpatientFilters } from "@/types/inpatient"
import type { Pagination } from "@/types/api"
import { fetchInpatientPatients } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function useInpatientList(filters?: InpatientFilters) {
  const [patients, setPatients] = useState<InpatientPatient[]>([])
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadPatients = useCallback(
    async (page: number = 1) => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsLoading(true)

      try {
        const { patients: data, pagination: paginationInfo } = await fetchInpatientPatients({
          filters,
          page,
          limit: DEFAULT_PAGINATION.limit,
        })

        if (!abortController.signal.aborted) {
          setPatients(data)
          setPagination(paginationInfo)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching inpatient patients:", error)
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
    loadPatients()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadPatients])

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadPatients(newPage)
    },
    [loadPatients]
  )

  const refresh = useCallback(() => {
    loadPatients(pagination.page)
  }, [loadPatients, pagination.page])

  return {
    patients,
    pagination,
    isLoading,
    handlePageChange,
    refresh,
  }
}
