/**
 * Lab Tests Hook
 * Fetches and manages lab tests with filtering
 */

import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { fetchLabTests } from "@/lib/services/lab.service"
import type { LabTest, LabTestFilters } from "@/types/lab"
import { getErrorMessage } from "@/lib/utils/error"

interface UseLabTestsOptions {
  initialFilters?: Partial<LabTestFilters>
  autoFetch?: boolean
}

interface UseLabTestsReturn {
  tests: LabTest[]
  loading: boolean
  filters: LabTestFilters
  setSearch: (search: string) => void
  setCategory: (category: string | undefined) => void
  setDepartment: (department: "LAB" | "RAD" | undefined) => void
  setIsActive: (isActive: boolean | undefined) => void
  refetch: () => void
}

export function useLabTests(options: UseLabTestsOptions = {}): UseLabTestsReturn {
  const { initialFilters = {}, autoFetch = true } = options

  const [tests, setTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [filters, setFilters] = useState<LabTestFilters>({
    search: initialFilters.search,
    category: initialFilters.category,
    department: initialFilters.department,
    isActive: initialFilters.isActive ?? true,
  })

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search || "", 500)

  // Fetch lab tests from service
  const fetchTests = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchLabTests({
        search: debouncedSearch,
        category: filters.category,
        department: filters.department,
        isActive: filters.isActive,
      })
      setTests(data)
    } catch (err) {
      setTests([])
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters.category, filters.department, filters.isActive])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchTests()
    }
  }, [fetchTests, autoFetch])

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  const setCategory = useCallback((category: string | undefined) => {
    setFilters((prev) => ({ ...prev, category }))
  }, [])

  const setDepartment = useCallback((department: "LAB" | "RAD" | undefined) => {
    setFilters((prev) => ({ ...prev, department }))
  }, [])

  const setIsActive = useCallback((isActive: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, isActive }))
  }, [])

  return {
    tests,
    loading,
    filters,
    setSearch,
    setCategory,
    setDepartment,
    setIsActive,
    refetch: fetchTests,
  }
}
