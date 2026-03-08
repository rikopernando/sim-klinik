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
 * Role Cache
 * In-memory cache to reduce database lookups for user roles
 * TTL: 60 seconds - balances performance with role change responsiveness
 */
interface CachedRole {
  role: UserRole
  timestamp: number
}

const roleCache = new Map<string, CachedRole>()
const ROLE_CACHE_TTL_MS = 60_000 // 1 minute

/**
 * Clear cached role for a user
 * Call this when a user's role is changed
 */
export function invalidateRoleCache(userId: string): void {
  roleCache.delete(userId)
}

/**
 * Clear all cached roles
 * Call this on server restart or when roles are bulk-updated
 */
export function clearRoleCache(): void {
  roleCache.clear()
}

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
 * Get user role from database with caching
 * Reduces database lookups by caching roles for 60 seconds
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  // Check cache first
  const cached = roleCache.get(userId)
  if (cached && Date.now() - cached.timestamp < ROLE_CACHE_TTL_MS) {
    return cached.role
  }

  // Cache miss - fetch from database
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

  const role = userRole.roleName as UserRole

  // Store in cache
  roleCache.set(userId, { role, timestamp: Date.now() })

  return role
}

/**
 * Get user permissions based on role
 * Uses cached role lookup for performance
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
