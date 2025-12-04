/**
 * Custom Hook for Patients Data Management
 * Handles fetching, searching, and pagination of patients
 */

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"

interface Patient {
  id: string
  mrNumber: string
  nik: string | null
  name: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  insuranceType: string | null
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsePatientsResult {
  patients: Patient[]
  loading: boolean
  searchQuery: string
  pagination: PaginationInfo
  setSearchQuery: (query: string) => void
  handlePageChange: (page: number) => void
  refetch: () => void
}

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export function usePatients(): UsePatientsResult {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION)

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Fetch patients from API
  const fetchPatients = useCallback(
    async (page: number = 1, search: string = "") => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        })

        if (search) {
          params.append("search", search)
        }

        const response = await fetch(`/api/patients?${params}`)
        if (!response.ok) {
          throw new Error("Failed to fetch patients")
        }

        const data = await response.json()
        setPatients(data.patients || [])
        setPagination(data.pagination)
      } catch (error) {
        console.error("Error fetching patients:", error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit]
  )

  // Effect: Fetch patients when debounced search changes
  useEffect(() => {
    fetchPatients(1, debouncedSearch)
  }, [debouncedSearch, fetchPatients])

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchPatients(newPage, debouncedSearch)
    },
    [debouncedSearch, fetchPatients]
  )

  // Refetch current page
  const refetch = useCallback(() => {
    fetchPatients(pagination.page, debouncedSearch)
  }, [pagination.page, debouncedSearch, fetchPatients])

  return {
    patients,
    loading,
    searchQuery,
    pagination,
    setSearchQuery,
    handlePageChange,
    refetch,
  }
}
