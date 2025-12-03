/**
 * Custom Hook for User Management
 * CRUD operations for users
 */

import { useState, useCallback } from "react"
import * as userService from "@/lib/services/user.service"
import type { User, Pagination } from "@/lib/services/user.service"

interface UseUsersResult {
  users: User[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  fetchUsers: (search?: string, page?: number, limit?: number) => Promise<void>
  deleteUser: (userId: string) => Promise<boolean>
  refreshUsers: () => Promise<void>
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSearch, setLastSearch] = useState<string | undefined>(undefined)
  const [lastPage, setLastPage] = useState<number>(1)
  const [lastLimit, setLastLimit] = useState<number>(10)

  const fetchUsers = useCallback(async (search?: string, page: number = 1, limit: number = 10) => {
    setIsLoading(true)
    setError(null)
    setLastSearch(search)
    setLastPage(page)
    setLastLimit(limit)

    try {
      const data = await userService.fetchUsers(search, page, limit)
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUsers = useCallback(async () => {
    await fetchUsers(lastSearch, lastPage, lastLimit)
  }, [fetchUsers, lastSearch, lastPage, lastLimit])

  const deleteUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await userService.deleteUser(userId)
        await refreshUsers()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Error deleting user:", err)
        return false
      }
    },
    [refreshUsers]
  )

  return {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    refreshUsers,
  }
}
