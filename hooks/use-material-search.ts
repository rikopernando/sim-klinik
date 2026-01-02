/**
 * useMaterialSearch Hook
 * Fetches materials from unified inventory system
 */

import { useState, useCallback, useEffect } from "react"

import { useDebounce } from "@/hooks/use-debounce"

export interface Material {
  id: string
  name: string
  category: string | null
  unit: string
  price: string
  minimumStock: number
  description: string | null
  totalStock: number
}

interface UseMaterialSearchReturn {
  materials: Material[]
  isLoading: boolean
  error: string | null
  search: (query: string) => void
}

export function useMaterialSearch(): UseMaterialSearchReturn {
  const [query, setQuery] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300)

  // Fetch materials from API
  const fetchMaterials = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append("search", searchQuery)
      }
      params.append("limit", "20")

      const response = await fetch(`/api/materials?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch materials")
      }

      setMaterials(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch materials"
      setError(errorMessage)
      setMaterials([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch when debounced query changes
  useEffect(() => {
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
