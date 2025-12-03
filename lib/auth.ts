import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { username, customSession } from "better-auth/plugins"
import { db } from "@/db" // your drizzle instance
import { account, session, user, verification } from "@/db/schema/auth"
import { userRoles, roles } from "@/db/schema/roles"
import { eq } from "drizzle-orm"
import { ROLE_PERMISSIONS } from "@/types/rbac"
import type { UserRole } from "@/types/rbac"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    customSession(async ({ user, session }) => {
      // Fetch user role from database
      const [userRole] = await db
        .select({
          roleName: roles.name,
          roleId: roles.id,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, user.id))
        .limit(1)

      // Get permissions based on role
      const role = userRole?.roleName as UserRole | undefined
      const permissions = role ? ROLE_PERMISSIONS[role] : []

      return {
        user: {
          ...user,
          role: role || null,
          roleId: userRole?.roleId || null,
          permissions,
        },
        session,
      }
    }),
  ],
})
