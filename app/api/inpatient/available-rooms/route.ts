/**
 * Available Rooms API Endpoint
 * GET /api/inpatient/available-rooms
 * Fetches rooms with available beds for bed assignment
 */

import { NextResponse } from "next/server"
import { gt } from "drizzle-orm"

import { db } from "@/db"
import { rooms } from "@/db/schema/inpatient"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"

export async function GET() {
  try {
    // Fetch rooms with available beds only
    const availableRooms = await db
      .select()
      .from(rooms)
      .where(gt(rooms.availableBeds, 0))
      .orderBy(rooms.roomNumber)

    const response: ResponseApi<typeof availableRooms> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Available Rooms fetched successfully",
      data: availableRooms,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching available rooms:", error)

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Gagal memuat data rooms"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
