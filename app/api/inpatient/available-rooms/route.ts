/**
 * Available Rooms API Endpoint
 * GET /api/inpatient/available-rooms
 * Fetches rooms with available beds for bed assignment
 * Requires: inpatient:read permission
 */

import { NextResponse } from "next/server"
import { gt, and, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { rooms, bedAssignments } from "@/db/schema/inpatient"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

export const GET = withRBAC(
  async () => {
    try {
      // Fetch rooms with available beds only
      const availableRooms = await db
        .select()
        .from(rooms)
        .where(gt(rooms.availableBeds, 0))
        .orderBy(rooms.roomNumber)

      const roomIds = availableRooms.map((room) => room.id)

      // Fetch currently occupied bed numbers for those rooms
      const activeAssignments = roomIds.length
        ? await db
            .select({
              roomId: bedAssignments.roomId,
              bedNumber: bedAssignments.bedNumber,
            })
            .from(bedAssignments)
            .where(
              and(inArray(bedAssignments.roomId, roomIds), isNull(bedAssignments.dischargedAt))
            )
        : []

      const occupiedBedsByRoom = new Map<string, string[]>()
      for (const { roomId, bedNumber } of activeAssignments) {
        occupiedBedsByRoom.set(roomId, [...(occupiedBedsByRoom.get(roomId) ?? []), bedNumber])
      }

      const roomsWithOccupiedBeds = availableRooms.map((room) => ({
        ...room,
        occupiedBedNumbers: occupiedBedsByRoom.get(room.id) ?? [],
      }))

      const response: ResponseApi<typeof roomsWithOccupiedBeds> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Available Rooms fetched successfully",
        data: roomsWithOccupiedBeds,
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
  },
  { permissions: ["inpatient:read"] }
)
