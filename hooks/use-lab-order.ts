/**
 * Lab Order Hook (Single Order)
 * Fetches a single lab order with full details
 */

import { useState, useEffect, useCallback } from "react"
import { fetchLabOrderById } from "@/lib/services/lab.service"
import type { LabOrderWithRelations } from "@/types/lab"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/error"

interface UseLabOrderOptions {
  orderId: string | null
  autoFetch?: boolean
}

interface UseLabOrderReturn {
  order: LabOrderWithRelations | null
  loading: boolean
  refetch: () => void
}

export function useLabOrder(options: UseLabOrderOptions): UseLabOrderReturn {
  const { orderId, autoFetch = true } = options

  const [order, setOrder] = useState<LabOrderWithRelations | null>(null)
  const [loading, setLoading] = useState(!!orderId && autoFetch)

  // Fetch lab order from service
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const data = await fetchLabOrderById(orderId)
      setOrder(data)
    } catch (error) {
      setOrder(null)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Auto-fetch on mount and when orderId changes
  useEffect(() => {
    if (autoFetch) {
      fetchOrder()
    }
  }, [fetchOrder, autoFetch])

  return {
    order,
    loading,
    refetch: fetchOrder,
  }
}
