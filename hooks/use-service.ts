import {
  createServiceRequest,
  getServicesRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceByIdRequest,
} from "@/lib/services/service.service"
import { useDebounce } from "./use-debounce"
import { getErrorMessage } from "@/lib/utils/error"
import { useCallback, useEffect, useState } from "react"
import { PayloadServices, ResultService } from "@/types/services"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UseServiceResult {
  isLoading: boolean
  refetch: () => void
  searchQuery: string
  services: ResultService[]
  pagination: PaginationInfo
  errorMessage: string | null
  setSearchQuery: (q: string) => void
  handlePageChange: (page: number) => void
  deleteService: (id: string) => Promise<boolean>
  getServiceById: (id: string) => Promise<ResultService | null>
  createService: (payload: PayloadServices) => Promise<ResultService | null>
  fetchServices: (page?: number, search?: string, includeInactive?: boolean) => Promise<void>
  updateService: (id: string, payload: Partial<PayloadServices>) => Promise<ResultService | null>
}
export function useService(): UseServiceResult {
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const [isLoading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [services, setServices] = useState<ResultService[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchServices = useCallback(
    async (page: number = 1, search: string = "") => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const response = await getServicesRequest({
          page,
          limit: pagination.limit,
          search,
        })
        if (response) {
          setServices(response.data || [])
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
    fetchServices(1, searchQuery)
  }, [searchQuery, fetchServices])

  const handlePageChange = useCallback(
    (page: number) => {
      fetchServices(page, debouncedSearch)
    },
    [debouncedSearch, fetchServices]
  )

  const refetch = useCallback(() => {
    fetchServices(pagination.page, debouncedSearch)
  }, [pagination.page, debouncedSearch, fetchServices])

  const createService = useCallback(
    async (payload: PayloadServices): Promise<ResultService> => {
      try {
        setLoading(true)
        const response = await createServiceRequest(payload)
        refetch()
        return response
      } catch (error) {
        console.error("Error creating service:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [refetch]
  )

  const updateService = useCallback(
    async (id: string, payload: Partial<PayloadServices>) => {
      try {
        setLoading(true)
        const upadated = await updateServiceRequest(id, payload)
        refetch()
        return upadated
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error update service:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [refetch]
  )

  const deleteService = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        await deleteServiceRequest(id)
        refetch()
        return true
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        console.error("Error deleting service:", error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [refetch]
  )

  const getServiceById = useCallback(async (id: string): Promise<ResultService | null> => {
    try {
      setLoading(true)
      const service = await getServiceByIdRequest(id)
      return service || null
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      console.error("Error fetching service by ID:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    refetch,
    services,
    isLoading,
    pagination,
    searchQuery,
    errorMessage,
    fetchServices,
    updateService,
    deleteService,
    createService,
    setSearchQuery,
    getServiceById,
    handlePageChange,
  }
}
