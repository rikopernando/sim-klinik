/**
 * useMaterialSearch Hook
 * Fetches materials from unified inventory system
 * Uses axios-based service layer for consistency
 */

import { useState, useCallback, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { searchMaterials } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"
import type { Material } from "@/types/material"

interface UseMaterialSearchReturn {
  materials: Material[]
  isLoading: boolean
  error: string | null
  search: (query: string) => void
}

const MIN_LENGTH_QUERY = 2

export function useMaterialSearch(): UseMaterialSearchReturn {
  const [query, setQuery] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300)

  // Fetch materials from API using service layer
  const fetchMaterials = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await searchMaterials({
        search: searchQuery || undefined,
        limit: 20,
      })
      setMaterials(results)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setMaterials([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < MIN_LENGTH_QUERY) {
      setMaterials([])
      return
    }

    fetchMaterials(debouncedQuery)
  }, [debouncedQuery, fetchMaterials])

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  return {
    materials,
    isLoading,
    error,
    search,
  }
}
