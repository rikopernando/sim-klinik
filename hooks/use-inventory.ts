/**
 * Inventory Hook
 * Manages drug inventory data fetching
 */

import { useState, useEffect, useCallback } from "react"
import {
  getAllInventories,
  getPaginatedInventories,
  type DrugInventoryWithDetails,
} from "@/lib/services/inventory.service"

interface UseInventoryOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseInventoryReturn {
  inventories: DrugInventoryWithDetails[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useInventory(options: UseInventoryOptions = {}): UseInventoryReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [inventories, setInventories] = useState<DrugInventoryWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getAllInventories()
      setInventories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Inventory fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchInventories()
  }, [fetchInventories])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchInventories()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchInventories])

  return {
    inventories,
    isLoading,
    error,
    refresh: fetchInventories,
  }
}

/**
 * Paginated Inventory Hook
 * Manages paginated drug inventory data with search support
 */
interface UsePaginatedInventoryOptions {
  initialPage?: number
  initialLimit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UsePaginatedInventoryReturn {
  inventories: DrugInventoryWithDetails[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  searchQuery: string
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  refresh: () => Promise<void>
}

export function usePaginatedInventory(
  options: UsePaginatedInventoryOptions = {}
): UsePaginatedInventoryReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const [inventories, setInventories] = useState<DrugInventoryWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  })

  const fetchInventories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getPaginatedInventories({
        search: searchQuery || undefined,
        page,
        limit,
      })

      setInventories(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Paginated inventory fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, page, limit])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchInventories()
  }, [fetchInventories])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchInventories()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchInventories])

  return {
    inventories,
    isLoading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    setPage,
    setLimit,
    refresh: fetchInventories,
  }
}
