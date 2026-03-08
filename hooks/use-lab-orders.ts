/**
 * Lab Orders Hook
 * Fetches and manages lab orders with filtering and pagination
 */

import { toast } from "sonner"
import { startOfDay } from "date-fns"
import { useState, useEffect, useCallback, useRef } from "react"
import { fetchLabOrders } from "@/lib/services/lab.service"
import type {
  LabOrderWithRelations,
  LabOrderFilters,
  OrderStatus,
  LAB_DEPARTMENTS,
} from "@/types/lab"
import type { Pagination } from "@/types/api"
import { getErrorMessage } from "@/lib/utils/error"

interface UseLabOrdersOptions {
  initialFilters?: Partial<LabOrderFilters>
  autoFetch?: boolean
  defaultToToday?: boolean
}

interface UseLabOrdersReturn {
  orders: LabOrderWithRelations[]
  loading: boolean
  filters: Partial<LabOrderFilters>
  pagination: Pagination | null
  setVisitId: (visitId: string | undefined) => void
  setPatientId: (patientId: string | undefined) => void
  setStatus: (status: OrderStatus | OrderStatus[] | undefined) => void
  setDepartment: (department: keyof typeof LAB_DEPARTMENTS | undefined) => void
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void
  setPage: (page: number) => void
  handlePageChange: (page: number) => void
  refetch: () => void
}

export function useLabOrders(options: UseLabOrdersOptions = {}): UseLabOrdersReturn {
  const { initialFilters = {}, autoFetch = true, defaultToToday = true } = options

  // Default date filters to today if defaultToToday is true
  const defaultFilters: Partial<LabOrderFilters> = {
    ...initialFilters,
  }
  if (defaultToToday && !initialFilters.dateFrom && !initialFilters.dateTo) {
    const today = startOfDay(new Date())
    defaultFilters.dateFrom = today
    defaultFilters.dateTo = today
  }

  const [orders, setOrders] = useState<LabOrderWithRelations[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [filters, setFilters] = useState<Partial<LabOrderFilters>>(defaultFilters)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch lab orders from service
  const fetchOrders = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)

    try {
      const result = await fetchLabOrders({
        ...filters,
        page,
        limit: 10,
      })
      setOrders(result.orders)
      setPagination(result.pagination)
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name === "AbortError") {
        return
      }
      setOrders([])
      setPagination(null)
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchOrders()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchOrders, autoFetch])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  // Filter setters
  const setVisitId = useCallback((visitId: string | undefined) => {
    setFilters((prev) => ({ ...prev, visitId }))
  }, [])

  const setPatientId = useCallback((patientId: string | undefined) => {
    setFilters((prev) => ({ ...prev, patientId }))
  }, [])

  const setStatus = useCallback((status: OrderStatus | OrderStatus[] | undefined) => {
    setFilters((prev) => ({ ...prev, status }))
  }, [])

  const setDepartment = useCallback((department: keyof typeof LAB_DEPARTMENTS | undefined) => {
    setFilters((prev) => ({ ...prev, department }))
  }, [])

  const setDateRange = useCallback((dateFrom: Date | undefined, dateTo: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  return {
    orders,
    loading,
    filters,
    pagination,
    setVisitId,
    setPatientId,
    setStatus,
    setDepartment,
    setDateRange,
    setPage,
    handlePageChange,
    refetch: fetchOrders,
  }
}
