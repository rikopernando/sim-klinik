/**
 * Doctors API
 * Get list of doctors for visit registration
 */

import { NextResponse } from "next/server"
import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { userRoles, roles } from "@/db/schema/roles"
import { eq, asc } from "drizzle-orm"
import { ResponseApi, ResponseError } from "@/types/api"
import { Pharmacist } from "@/types/user"
import HTTP_STATUS_CODES from "@/lib/constants/http"

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
      .orderBy(asc(user.name))

    const response: ResponseApi<Pharmacist[]> = {
      message: "pharmacists fetched successfully",
      data: pharmacists,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching pharmacists:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch doctors data",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
