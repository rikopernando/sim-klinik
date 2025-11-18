/**
 * Get Current User with Role
 * API endpoint to fetch current user's role and permissions
 */

import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/rbac/session";

export async function GET() {
    try {
        const user = await getCurrentUserWithRole();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Not logged in" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
        });
    } catch (error) {
        console.error("Error fetching user role:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: "Failed to fetch user role" },
            { status: 500 }
        );
    }
}
