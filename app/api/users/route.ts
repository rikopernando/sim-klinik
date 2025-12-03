/**
 * User Management API
 * CRUD operations for users (Super Admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { userRoles, roles } from "@/db/schema/roles"
import { eq, desc, or, like, count } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"
import { auth } from "@/lib/auth"

/**
 * POST /api/users
 * Create a new user
 */
export const POST = withRBAC(
  async (req: NextRequest) => {
    const body = await req.json()
    const { name, email, username, password, roleId } = body

    // Validate input
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: "Name, email, username, and password are required" },
        { status: 400 }
      )
    }

    try {
      // Create user via Better Auth API with username plugin
      const result = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
          username,
        },
      })

      if (!result || !result.user) {
        throw new Error("Failed to create user")
      }

      // Assign role if provided
      if (roleId) {
        await db.insert(userRoles).values({
          userId: result.user.id,
          roleId: roleId,
          assignedBy: result.user.id, // TODO: Get current user ID from session
        })
      }

      return NextResponse.json(
        {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            username: result.user.username,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error("Error creating user:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create user" },
        { status: 500 }
      )
    }
  },
  {
    permissions: ["system:admin"],
  }
)

/**
 * GET /api/users
 * List all users with their roles
 */
export const GET = withRBAC(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Build base query
    let baseCondition
    if (search) {
      baseCondition = or(like(user.name, `%${search}%`), like(user.email, `%${search}%`))
    }

    // Get total count
    const countQuery = baseCondition
      ? db.select({ count: count() }).from(user).where(baseCondition)
      : db.select({ count: count() }).from(user)

    const [{ count: total }] = await countQuery

    // Get paginated users
    let query = db
      .select({
        user: user,
        role: roles,
      })
      .from(user)
      .leftJoin(userRoles, eq(user.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset)

    if (baseCondition) {
      query = query.where(baseCondition) as typeof query
    }

    const users = await query

    // Transform data to include role info
    const usersWithRoles = users.map((row) => ({
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      username: row.user.username,
      emailVerified: row.user.emailVerified,
      image: row.user.image,
      createdAt: row.user.createdAt,
      updatedAt: row.user.updatedAt,
      role: row.role?.name || null,
      roleId: row.role?.id || null,
    }))

    return NextResponse.json({
      users: usersWithRoles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  },
  {
    permissions: ["system:admin"], // Only super_admin has this permission
  }
)
