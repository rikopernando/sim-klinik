/**
 * Lab Orders Hook
 * Fetches and manages lab orders with filtering
 */

import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import { fetchLabOrders } from "@/lib/services/lab.service"
import type { LabOrderWithRelations, LabOrderFilters, OrderStatus } from "@/types/lab"
import { getErrorMessage } from "@/lib/utils/error"

interface UseLabOrdersOptions {
  initialFilters?: Partial<LabOrderFilters>
  autoFetch?: boolean
}

interface UseLabOrdersReturn {
  orders: LabOrderWithRelations[]
  loading: boolean
  filters: Partial<LabOrderFilters>
  setVisitId: (visitId: string | undefined) => void
  setPatientId: (patientId: string | undefined) => void
  setStatus: (status: OrderStatus | OrderStatus[] | undefined) => void
  setDepartment: (department: "LAB" | "RAD" | undefined) => void
  refetch: () => void
}

export function useLabOrders(options: UseLabOrdersOptions = {}): UseLabOrdersReturn {
  const { initialFilters = {}, autoFetch = true } = options

  const [orders, setOrders] = useState<LabOrderWithRelations[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [filters, setFilters] = useState<Partial<LabOrderFilters>>(initialFilters)

  // Fetch lab orders from service
  const fetchOrders = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchLabOrders(filters)
      setOrders(data)
    } catch (err) {
      setOrders([])
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchOrders()
    }
  }, [fetchOrders, autoFetch])

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

  const setDepartment = useCallback((department: "LAB" | "RAD" | undefined) => {
    setFilters((prev) => ({ ...prev, department }))
  }, [])

  return {
    orders,
    loading,
    filters,
    setVisitId,
    setPatientId,
    setStatus,
    setDepartment,
    refetch: fetchOrders,
  }
}
