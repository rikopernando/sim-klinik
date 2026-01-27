/**
 * usePagePermission Hook
 * Client-side page-level permission checking with redirect
 *
 * Usage:
 * ```tsx
 * // In a protected page component
 * function ProtectedPage() {
 *   const { isAuthorized, isLoading } = usePagePermission({
 *     permissions: ['billing:read']
 *   })
 *
 *   if (isLoading) return <LoadingSkeleton />
 *   if (!isAuthorized) return null // Already redirecting
 *
 *   return <PageContent />
 * }
 * ```
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermission } from "./use-permission"
import type { Permission, UserRole } from "@/types/rbac"

interface UsePagePermissionOptions {
  /**
   * Required permissions (user must have at least one)
   */
  permissions?: Permission[]

  /**
   * Required roles (user must have one of these roles)
   */
  roles?: UserRole[]

  /**
   * Redirect URL when unauthorized (defaults to /dashboard)
   */
  redirectTo?: string

  /**
   * If true, requires ALL permissions instead of ANY
   */
  requireAll?: boolean
}

interface UsePagePermissionReturn {
  /**
   * Whether the user is authorized to view the page
   */
  isAuthorized: boolean

  /**
   * Whether permission check is still loading
   */
  isLoading: boolean

  /**
   * Current user's role
   */
  userRole: UserRole | null
}

/**
 * Hook for checking page-level permissions with automatic redirect
 */
export function usePagePermission(options: UsePagePermissionOptions = {}): UsePagePermissionReturn {
  const { permissions = [], roles = [], redirectTo = "/dashboard", requireAll = false } = options

  const router = useRouter()
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, userRole, isLoading } = usePermission()

  // Determine authorization
  let isAuthorized = true

  if (!isLoading && userRole) {
    // Check role requirements
    if (roles.length > 0) {
      isAuthorized = hasAnyRole(roles)
    }

    // Check permission requirements (if roles not specified or passed)
    if (isAuthorized && permissions.length > 0) {
      if (requireAll) {
        isAuthorized = hasAllPermissions(permissions)
      } else {
        isAuthorized = hasAnyPermission(permissions)
      }
    }
  } else if (!isLoading && !userRole) {
    // No role means no authorization for protected pages
    isAuthorized = false
  }

  // Redirect if not authorized (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthorized, router, redirectTo])

  return {
    isAuthorized,
    isLoading,
    userRole,
  }
}

/**
 * Page permission configurations for common dashboard pages
 */
export const PAGE_PERMISSIONS = {
  queue: { permissions: ["visits:read"] as Permission[] },
  doctor: { roles: ["doctor", "super_admin", "admin"] as UserRole[] },
  pharmacy: { permissions: ["prescriptions:read", "pharmacy:read"] as Permission[] },
  cashier: { permissions: ["billing:read"] as Permission[] },
  laboratory: { permissions: ["lab:read"] as Permission[] },
  inpatient: { permissions: ["inpatient:read"] as Permission[] },
  medicalRecords: { permissions: ["medical_records:read"] as Permission[] },
  users: { roles: ["super_admin"] as UserRole[] },
  registration: { permissions: ["patients:write", "visits:write"] as Permission[] },
  patients: { permissions: ["patients:read"] as Permission[] },
  emergency: { permissions: ["visits:read"] as Permission[] },
  discharge: { permissions: ["discharge:read"] as Permission[] },
  masterData: { roles: ["super_admin", "admin"] as UserRole[] },
} as const
