/**
 * RBAC (Role-Based Access Control)
 * Centralized exports for role and permission management
 */

// Session utilities
export {
    getSession,
    getUserRole,
    getUserPermissions,
    getCurrentUserWithRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
} from "./session";

// Middleware
export {
    requireAuth,
    requireRole,
    requireAnyRole,
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    withRBAC,
    RBAC_ERRORS,
} from "./middleware";

// Types (re-export from types/rbac)
export type { UserRole, Permission, UserWithRole } from "@/types/rbac";
export { USER_ROLES, ROLE_PERMISSIONS, ROLE_INFO, ROLE_ROUTES } from "@/types/rbac";
