import { useDebounce } from "@/hooks/use-debounce"
import { getErrorMessage } from "@/lib/utils/error"
import { ResultPoli, PayloadPoli } from "@/types/poli"
import { useCallback, useEffect, useState } from "react"
import { deletePoliRequest } from "@/lib/services/poli.service"
import { getPolisRequest, createPoliRequest, updatePoliRequest } from "@/lib/services/poli.service"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsePoliResult {
  polis: ResultPoli[]
  isLoading: boolean
  refetch: () => void
  searchQuery: string
  includeInactive: boolean
  pagination: PaginationInfo
  errorMessage: string | null
  setSearchQuery: (q: string) => void
  setIncludeInactive: (v: boolean) => void
  handlePageChange: (page: number) => void
  deletePoli: (id: string) => Promise<boolean>
  createPoli: (payload: PayloadPoli) => Promise<ResultPoli | null>
  updatePoli: (id: string, payload: Partial<PayloadPoli>) => Promise<ResultPoli | null>
  fetchPolis: (page?: number, search?: string, includeInactive?: boolean) => Promise<void>
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
        const response = await getPolisRequest({
          page,
          limit: pagination.limit,
          search,
          includeInactive: includeInactiveFlag,
        })
        if (response) {
          setPolis(response.data || [])
          if (response.meta) {
            setPagination({
              page: response.meta.page,
              limit: response.meta.limit,
              total: response.meta.total,
              totalPages: Math.ceil(response.meta.total / response.meta.limit),
            })
          }
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
        const created = await createPoliRequest(payload)
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
        const updated = await updatePoliRequest(id, payload)
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
        await deletePoliRequest(id)
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
    refetch,
    isLoading,
    fetchPolis,
    createPoli,
    updatePoli,
    deletePoli,
    pagination,
    searchQuery,
    errorMessage,
    setSearchQuery,
    includeInactive,
    handlePageChange,
    setIncludeInactive,
  }
}
