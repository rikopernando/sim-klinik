import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"

import { getPolis } from "@/lib/services/poli.service"
import { ResultPoli, PayloadPoli } from "@/types/poli"
import { getErrorMessage } from "@/lib/utils/error"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsePoliResult {
  polis: ResultPoli[]
  fetchPolis: (page?: number, search?: string, includeInactive?: boolean) => Promise<void>
  isLoading: boolean
  errorMessage: string | null
  createPoli: (payload: PayloadPoli) => Promise<ResultPoli | null>
  updatePoli: (id: string, payload: Partial<PayloadPoli>) => Promise<ResultPoli | null>
  deletePoli: (id: string) => Promise<boolean>
  pagination: PaginationInfo
  searchQuery: string
  setSearchQuery: (q: string) => void
  includeInactive: boolean
  setIncludeInactive: (v: boolean) => void
  handlePageChange: (page: number) => void
  refetch: () => void
}

export function usePoli(): UsePoliResult {
  const [polis, setPolis] = useState<ResultPoli[]>([])
  const [isLoading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [includeInactive, setIncludeInactive] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const debouncedSearch = useDebounce(searchQuery, 500)

  const fetchPolis = useCallback(
    async (page: number = 1, search: string = "", includeInactiveFlag: boolean = false) => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const res = await getPolis({
          page,
          limit: pagination.limit,
          search,
          includeInactive: includeInactiveFlag,
        })
        if (res) {
          setPolis(res.data || [])
          if (res.meta) {
            setPagination({
              page: res.meta.page,
              limit: res.meta.limit,
              total: res.meta.total,
              totalPages: Math.ceil(res.meta.total / res.meta.limit),
            })
          }
        } else {
          setPolis([])
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error fetching polis:", error)
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit]
  )

  useEffect(() => {
    fetchPolis(1, debouncedSearch, includeInactive)
  }, [debouncedSearch, includeInactive, fetchPolis])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      fetchPolis(page, debouncedSearch, includeInactive)
    },
    [debouncedSearch, includeInactive, fetchPolis]
  )

  const refetch = useCallback(() => {
    fetchPolis(pagination.page, debouncedSearch, includeInactive)
  }, [pagination.page, debouncedSearch, includeInactive, fetchPolis])

  const createPoli = useCallback(
    async (payload: PayloadPoli) => {
      try {
        setLoading(true)
        const created = await (await import("@/lib/services/poli.service")).createPoli(payload)
        // Refresh list (keep current page/search)
        await fetchPolis(pagination.page, debouncedSearch, includeInactive)
        return created
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error creating poli:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [fetchPolis, pagination.page, debouncedSearch, includeInactive]
  )

  const updatePoli = useCallback(
    async (id: string, payload: Partial<PayloadPoli>) => {
      try {
        setLoading(true)
        const updated = await (await import("@/lib/services/poli.service")).updatePoli(id, payload)
        await fetchPolis(pagination.page, debouncedSearch, includeInactive)
        return updated
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error updating poli:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [fetchPolis, pagination.page, debouncedSearch, includeInactive]
  )

  const deletePoli = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await (await import("@/lib/services/poli.service")).deletePoli(id)
        await fetchPolis(pagination.page, debouncedSearch, includeInactive)
        return true
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error deleting poli:", error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [fetchPolis, pagination.page, debouncedSearch, includeInactive]
  )

  return {
    polis,
    fetchPolis,
    isLoading,
    errorMessage,
    createPoli,
    updatePoli,
    deletePoli,
    pagination,
    searchQuery,
    setSearchQuery,
    includeInactive,
    setIncludeInactive,
    handlePageChange,
    refetch,
  }
}
