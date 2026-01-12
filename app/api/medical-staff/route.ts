/**
 * Medical Staff API Route
 * GET /api/medical-staff - Get all doctors and nurses
 */

import { NextResponse } from "next/server"
import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { userRoles, roles } from "@/db/schema/roles"
import { eq, or } from "drizzle-orm"

export async function GET() {
  try {
    // Get all users with doctor or nurse roles
    const medicalStaff = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: roles.name,
      })
      .from(user)
      .innerJoin(userRoles, eq(user.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(or(eq(roles.name, "doctor"), eq(roles.name, "nurse")))
      .orderBy(roles.name, user.name)

    return NextResponse.json({
      success: true,
      data: medicalStaff,
    })
  } catch (error) {
    console.error("Error fetching medical staff:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch medical staff",
      },
      { status: 500 }
    )
  }
}
