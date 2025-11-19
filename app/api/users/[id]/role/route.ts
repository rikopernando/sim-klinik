/**
 * User Role Assignment API
 * Assign or change user role
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { userRoles, roles } from "@/db/schema/roles";
import { eq, and } from "drizzle-orm";
import { withRBAC } from "@/lib/rbac/middleware";

/**
 * PUT /api/users/[id]/role
 * Assign or update user role
 */
export const PUT = withRBAC(
    async (req: NextRequest, { params, user: currentUser }: { params: { id: string }; user: { id: string; email: string; name: string } }) => {
        const userId = params.id;
        const body = await req.json();

        const { roleId } = body;

        if (!roleId) {
            return NextResponse.json(
                { error: "roleId is required" },
                { status: 400 }
            );
        }

        // Check if user exists
        const [targetUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (!targetUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if role exists
        const [role] = await db
            .select()
            .from(roles)
            .where(eq(roles.id, roleId))
            .limit(1);

        if (!role) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Check if user already has a role
        const [existingUserRole] = await db
            .select()
            .from(userRoles)
            .where(eq(userRoles.userId, userId))
            .limit(1);

        if (existingUserRole) {
            // Update existing role
            await db
                .update(userRoles)
                .set({
                    roleId: roleId,
                    assignedBy: currentUser.id,
                    assignedAt: new Date(),
                })
                .where(eq(userRoles.userId, userId));
        } else {
            // Create new role assignment
            await db.insert(userRoles).values({
                userId: userId,
                roleId: roleId,
                assignedBy: currentUser.id,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Role "${role.name}" assigned to user successfully`,
            role: role.name,
        });
    },
    {
        permissions: ["system:admin"],
    }
);

/**
 * DELETE /api/users/[id]/role
 * Remove user role
 */
export const DELETE = withRBAC(
    async (req: NextRequest, { params }: { params: { id: string } }) => {
        const userId = params.id;

        // Delete role assignment
        const result = await db
            .delete(userRoles)
            .where(eq(userRoles.userId, userId))
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: "User has no role assigned" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Role removed successfully",
        });
    },
    {
        permissions: ["system:admin"],
    }
);
