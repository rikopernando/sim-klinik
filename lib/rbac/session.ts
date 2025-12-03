/**
 * RBAC Session Utilities
 * Helper functions to get user role and permissions from session
 */

import { db } from "@/db"
import { userRoles, roles } from "@/db/schema/roles"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import type { UserRole, Permission } from "@/types/rbac"
import { ROLE_PERMISSIONS } from "@/types/rbac"
import { headers } from "next/headers"

/**
 * Get current session from Better Auth
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const [userRole] = await db
    .select({
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .limit(1)

  if (!userRole) {
    return null
  }

  return userRole.roleName as UserRole
}

/**
 * Get user permissions based on role
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const role = await getUserRole(userId)

  if (!role) {
    return []
  }

  return ROLE_PERMISSIONS[role] || []
}

/**
 * Get current user with role
 */
export async function getCurrentUserWithRole() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  const role = await getUserRole(session.user.id)
  const permissions = role ? ROLE_PERMISSIONS[role] : []

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
    permissions,
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissionsToCheck: Permission[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissionsToCheck.some((p) => permissions.includes(p))
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissionsToCheck: Permission[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissionsToCheck.every((p) => permissions.includes(p))
}

/**
 * Check if user has specific role
 */
export async function hasRole(userId: string, roleToCheck: UserRole): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === roleToCheck
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, rolesToCheck: UserRole[]): Promise<boolean> {
  const role = await getUserRole(userId)
  return role ? rolesToCheck.includes(role) : false
}
