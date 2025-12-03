/**
 * Custom Hook for Roles
 * Fetch available roles
 */

import { useState, useCallback } from "react"
import * as roleService from "@/lib/services/role.service"
import type { Role } from "@/lib/services/role.service"

interface UseRolesResult {
  roles: Role[]
  isLoading: boolean
  error: string | null
  fetchRoles: () => Promise<void>
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await roleService.fetchRoles()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching roles:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
  }
}
