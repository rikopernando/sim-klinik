/**
 * usePermission Hook
 * Client-side permission checking for UI component visibility
 *
 * Usage:
 * ```tsx
 * const { hasPermission, hasAnyPermission, hasRole } = usePermission()
 *
 * if (hasPermission('inpatient:write')) {
 *   // Show edit button
 * }
 *
 * if (hasAnyPermission(['inpatient:write', 'inpatient:manage_beds'])) {
 *   // Show action menu
 * }
 * ```
 */

import { useSession } from "@/lib/auth-client"
import type { Permission, UserRole } from "@/types/rbac"
import { ROLE_PERMISSIONS } from "@/types/rbac"

interface UsePermissionReturn {
  /**
   * Check if user has a specific permission
   */
  hasPermission: (permission: Permission) => boolean

  /**
   * Check if user has ANY of the specified permissions
   */
  hasAnyPermission: (permissions: Permission[]) => boolean

  /**
   * Check if user has ALL of the specified permissions
   */
  hasAllPermissions: (permissions: Permission[]) => boolean

  /**
   * Check if user has a specific role
   */
  hasRole: (role: UserRole) => boolean

  /**
   * Check if user has ANY of the specified roles
   */
  hasAnyRole: (roles: UserRole[]) => boolean

  /**
   * Current user's role
   */
  userRole: UserRole | null

  /**
   * Current user's permissions
   */
  userPermissions: Permission[]

  /**
   * Loading state
   */
  isLoading: boolean
}

/**
 * Hook for checking user permissions on the client side
 * Used to show/hide UI elements based on user's role and permissions
 */
export function usePermission(): UsePermissionReturn {
  const { data: session, isPending } = useSession()

  // Get user's role from session
  const userRole = (session?.user?.role as UserRole) || null

  // Get user's permissions based on role
  const userPermissions: Permission[] = userRole ? ROLE_PERMISSIONS[userRole] || [] : []

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false
    return userPermissions.includes(permission)
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole || permissions.length === 0) return false
    return permissions.some((permission) => userPermissions.includes(permission))
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole || permissions.length === 0) return false
    return permissions.every((permission) => userPermissions.includes(permission))
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return userRole === role
  }

  /**
   * Check if user has ANY of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userRole || roles.length === 0) return false
    return roles.includes(userRole)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    userRole,
    userPermissions,
    isLoading: isPending,
  }
}
