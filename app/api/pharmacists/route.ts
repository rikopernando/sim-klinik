/**
 * Doctors API
 * Get list of doctors for visit registration
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { userRoles, roles } from "@/db/schema/roles";
import { eq, asc } from "drizzle-orm";

/**
 * GET /api/doctors
 * Get all users with doctor role
 */
export async function GET() {
    try {
        const pharmacists = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
            })
            .from(user)
            .innerJoin(userRoles, eq(user.id, userRoles.userId))
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(roles.name, "pharmacist"))
            .orderBy(asc(user.name));

        return NextResponse.json({
            pharmacists: pharmacists.map((doc) => ({
                id: doc.id,
                name: doc.name,
                email: doc.email,
            })),
        });
    } catch (error) {
        console.error("Error fetching pharmacists:", error);
        return NextResponse.json(
            { error: "Failed to fetch pharmacists" },
            { status: 500 }
        );
    }
}
