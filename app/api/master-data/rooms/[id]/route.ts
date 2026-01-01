/**
 * Master Data - Room Detail API
 * Get, update, and delete individual rooms
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { rooms, bedAssignments } from "@/db/schema/inpatient"
import { roomUpdateSchema } from "@/lib/validations/rooms"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { eq, and, isNull } from "drizzle-orm"

/**
 * GET /api/master-data/rooms/[id]
 * Get a single room by ID
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)

    if (!room) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Room not found",
        error: "Room with the specified ID does not exist",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
    }

    const response: ResponseApi<typeof room> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Room fetched successfully",
      data: room,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching room:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to fetch room"
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

/**
 * PUT /api/master-data/rooms/[id]
 * Update a room
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if room exists
    const [existingRoom] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)

    if (!existingRoom) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Room not found",
        error: "Room with the specified ID does not exist",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
    }

    // Validate input
    const validatedData = roomUpdateSchema.parse(body)

    // If bedCount is being reduced, check if it's safe
    if (validatedData.bedCount !== undefined && validatedData.bedCount < existingRoom.bedCount) {
      // Count currently occupied beds
      const occupiedBeds = await db
        .select()
        .from(bedAssignments)
        .where(and(eq(bedAssignments.roomId, id), isNull(bedAssignments.dischargedAt)))

      if (occupiedBeds.length > validatedData.bedCount) {
        const response: ResponseError<unknown> = {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Cannot reduce bed count",
          error: `Cannot reduce bed count to ${validatedData.bedCount} because ${occupiedBeds.length} beds are currently occupied`,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Update availableBeds accordingly
      const newAvailableBeds = validatedData.bedCount - occupiedBeds.length
      validatedData.availableBeds = newAvailableBeds
    }

    // If room number is being changed, check uniqueness
    if (validatedData.roomNumber && validatedData.roomNumber !== existingRoom.roomNumber) {
      const [duplicateRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomNumber, validatedData.roomNumber))
        .limit(1)

      if (duplicateRoom) {
        const response: ResponseError<unknown> = {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Room number already exists",
          error: "Room number must be unique",
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }
    }

    // Update room
    const [updatedRoom] = await db
      .update(rooms)
      .set(validatedData)
      .where(eq(rooms.id, id))
      .returning()

    const response: ResponseApi<typeof updatedRoom> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Room updated successfully",
      data: updatedRoom,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation error",
        error: error.issues,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    console.error("Room update error:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to update room"
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

/**
 * DELETE /api/master-data/rooms/[id]
 * Delete a room (soft delete by setting isActive to 'inactive')
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if room exists
    const [existingRoom] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)

    if (!existingRoom) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Room not found",
        error: "Room with the specified ID does not exist",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
    }

    // Check if room has active bed assignments
    const activeBeds = await db
      .select()
      .from(bedAssignments)
      .where(and(eq(bedAssignments.roomId, id), isNull(bedAssignments.dischargedAt)))
      .limit(1)

    if (activeBeds.length > 0) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Cannot delete room",
        error:
          "Cannot delete room with active bed assignments. Please discharge all patients first.",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    // Soft delete - set isActive to 'inactive'
    await db
      .update(rooms)
      .set({
        isActive: "inactive",
        status: "maintenance",
      })
      .where(eq(rooms.id, id))

    const response: ResponseApi = {
      status: HTTP_STATUS_CODES.OK,
      message: "Room deleted successfully",
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Room deletion error:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to delete room"
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
