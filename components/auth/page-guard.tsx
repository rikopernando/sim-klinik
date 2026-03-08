"use client"

import { usePagePermission } from "@/hooks/use-page-permission"
import type { Permission, UserRole } from "@/types/rbac"

interface PageGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean
}

/**
 * PageGuard component
 * Wraps page content so that hooks inside children only execute when the user is authorized.
 * Redirects unauthorized users to /dashboard/unauthorized.
 */
export function PageGuard({ children, permissions, roles, requireAll }: PageGuardProps) {
  const { isAuthorized, isLoading } = usePagePermission({
    permissions,
    roles,
    requireAll,
    redirectTo: "/dashboard/unauthorized",
  })

  if (isLoading) return null
  if (!isAuthorized) return null

  return <>{children}</>
}
