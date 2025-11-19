/**
 * User Management API - Single User Operations
 * GET, PUT, DELETE for specific user
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { userRoles, roles } from "@/db/schema/roles";
import { eq } from "drizzle-orm";
import { withRBAC } from "@/lib/rbac/middleware";

/**
 * GET /api/users/[id]
 * Get single user with role
 */
export const GET = withRBAC(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const userId = params.id;

        const [userWithRole] = await db
            .select({
                user: user,
                role: roles,
            })
            .from(user)
            .leftJoin(userRoles, eq(user.id, userRoles.userId))
            .leftJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(user.id, userId))
            .limit(1);

        if (!userWithRole) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: userWithRole.user.id,
                name: userWithRole.user.name,
                email: userWithRole.user.email,
                username: userWithRole.user.username,
                emailVerified: userWithRole.user.emailVerified,
                image: userWithRole.user.image,
                createdAt: userWithRole.user.createdAt,
                updatedAt: userWithRole.user.updatedAt,
                role: userWithRole.role?.name || null,
                roleId: userWithRole.role?.id || null,
            },
        });
    },
    {
        permissions: ["system:admin"],
    }
);

/**
 * PUT /api/users/[id]
 * Update user information
 */
export const PUT = withRBAC(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const userId = params.id;
        const body = await req.json();

        const { name, email, username } = body;

        // Validate input
        if (!name && !email && !username) {
            return NextResponse.json(
                { error: "At least one field (name, email, or username) is required" },
                { status: 400 }
            );
        }

        // Check if user exists
        const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update user
        const updateData: Record<string, string | Date> = {
            updatedAt: new Date(),
        };

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (username) updateData.username = username;

        const [updatedUser] = await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, userId))
            .returning();

        return NextResponse.json({ user: updatedUser });
    },
    {
        permissions: ["system:admin"],
    }
);

/**
 * DELETE /api/users/[id]
 * Delete user
 */
export const DELETE = withRBAC(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const userId = params.id;

        // Check if user exists
        const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prevent deleting yourself
        // Note: Would need to check current user ID from session
        // For now, just delete

        // Delete user (CASCADE will handle related records)
        await db.delete(user).where(eq(user.id, userId));

        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        });
    },
    {
        permissions: ["system:admin"],
    }
);
