/**
 * RBAC Middleware
 * API route protection with role and permission checking
 */

import { NextRequest, NextResponse } from "next/server"
import type { UserRole, Permission } from "@/types/rbac"
import {
  getSession,
  getUserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
} from "./session"

/**
 * Error responses
 */
export const RBAC_ERRORS = {
  UNAUTHORIZED: {
    error: "Unauthorized",
    message: "You must be logged in to access this resource",
  },
  FORBIDDEN: {
    error: "Forbidden",
    message: "You do not have permission to access this resource",
  },
  INVALID_ROLE: {
    error: "Invalid Role",
    message: "Your account does not have a valid role assigned",
  },
} as const

/**
 * Require authentication (user must be logged in)
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.UNAUTHORIZED, { status: 401 }),
    }
  }

  return {
    authorized: true,
    user: session.user,
  }
}

/**
 * Require specific role
 */
export async function requireRole(roleRequired: UserRole) {
  const authCheck = await requireAuth()

  if (!authCheck.authorized) {
    return authCheck
  }

  const userRole = await getUserRole(authCheck.user.id)

  if (!userRole) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.INVALID_ROLE, { status: 403 }),
    }
  }

  if (userRole !== roleRequired) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  return {
    authorized: true,
    user: authCheck.user,
    role: userRole,
  }
}

/**
 * Require any of the specified roles
 */
export async function requireAnyRole(rolesRequired: UserRole[]) {
  const authCheck = await requireAuth()

  if (!authCheck.authorized) {
    return authCheck
  }

  const userRole = await getUserRole(authCheck.user.id)

  if (!userRole) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.INVALID_ROLE, { status: 403 }),
    }
  }

  const hasRequiredRole = await hasAnyRole(authCheck.user.id, rolesRequired)

  if (!hasRequiredRole) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  return {
    authorized: true,
    user: authCheck.user,
    role: userRole,
  }
}

/**
 * Require specific permission
 */
export async function requirePermission(permissionRequired: Permission) {
  const authCheck = await requireAuth()

  if (!authCheck.authorized) {
    return authCheck
  }

  const hasRequiredPermission = await hasPermission(authCheck.user.id, permissionRequired)

  if (!hasRequiredPermission) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  const userRole = await getUserRole(authCheck.user.id)

  return {
    authorized: true,
    user: authCheck.user,
    role: userRole,
  }
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissionsRequired: Permission[]) {
  const authCheck = await requireAuth()

  if (!authCheck.authorized) {
    return authCheck
  }

  const hasRequiredPermission = await hasAnyPermission(authCheck.user.id, permissionsRequired)

  if (!hasRequiredPermission) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  const userRole = await getUserRole(authCheck.user.id)

  return {
    authorized: true,
    user: authCheck.user,
    role: userRole,
  }
}

/**
 * Require all of the specified permissions
 */
export async function requireAllPermissions(permissionsRequired: Permission[]) {
  const authCheck = await requireAuth()

  if (!authCheck.authorized) {
    return authCheck
  }

  const hasRequiredPermissions = await hasAllPermissions(authCheck.user.id, permissionsRequired)

  if (!hasRequiredPermissions) {
    return {
      authorized: false,
      response: NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  const userRole = await getUserRole(authCheck.user.id)

  return {
    authorized: true,
    user: authCheck.user,
    role: userRole,
  }
}

/**
 * Higher-order function to wrap API route handlers with RBAC checks
 *
 * Usage:
 * ```typescript
 * export const GET = withRBAC(
 *   async (req, context) => {
 *     // Your route handler
 *     return NextResponse.json({ data: "..." });
 *   },
 *   { permissions: ["patients:read"] }
 * );
 * ```
 */
export function withRBAC<TParams = Record<string, string | string[]>>(
  handler: (
    req: NextRequest,
    context: {
      params: TParams
      user: { id: string; email: string; name: string }
      role?: UserRole | null
    }
  ) => Promise<NextResponse>,
  options: {
    roles?: UserRole[]
    permissions?: Permission[]
    requireAll?: boolean // For permissions, require all or any (default: any)
  } = {}
) {
  return async (req: NextRequest, context: { params: TParams }) => {
    // Check authentication
    const authCheck = await requireAuth()
    if (!authCheck.authorized) {
      return authCheck.response
    }

    const userId = authCheck?.user?.id ?? ""
    const userRole = await getUserRole(userId)

    // Check role if specified
    if (options.roles && options.roles.length > 0) {
      const roleCheck = await hasAnyRole(userId, options.roles)
      if (!roleCheck) {
        return NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 })
      }
    }

    // Check permissions if specified
    if (options.permissions && options.permissions.length > 0) {
      const permissionCheck = options.requireAll
        ? await hasAllPermissions(userId, options.permissions)
        : await hasAnyPermission(userId, options.permissions)

      if (!permissionCheck) {
        return NextResponse.json(RBAC_ERRORS.FORBIDDEN, { status: 403 })
      }
    }

    // Call the actual handler with user context
    return handler(req, { params: context.params, user: authCheck.user, role: userRole })
  }
}
