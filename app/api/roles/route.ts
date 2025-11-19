/**
 * Roles API
 * Get all available roles
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { roles } from "@/db/schema/roles";
import { withRBAC } from "@/lib/rbac/middleware";

/**
 * GET /api/roles
 * List all roles
 */
export const GET = withRBAC(
    async () => {
        const allRoles = await db.select().from(roles);

        return NextResponse.json({ roles: allRoles });
    },
    {
        permissions: ["system:admin"],
    }
);
