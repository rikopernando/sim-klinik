/**
 * Room Management API
 * CRUD operations for hospital rooms
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { roomSchema, roomUpdateSchema } from "@/lib/inpatient/validation"
import { getAllRoomsWithOccupancy, createRoom, updateRoom } from "@/lib/inpatient/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * GET /api/rooms
 * Get all rooms with occupancy status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || undefined
    const roomType = searchParams.get("roomType") || undefined

    const roomsWithOccupancy = await getAllRoomsWithOccupancy(status, roomType)

    const response: ResponseApi<typeof roomsWithOccupancy> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Rooms fetched successfully",
      data: roomsWithOccupancy,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching rooms:", error)

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

/**
 * POST /api/rooms
 * Create a new room
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = roomSchema.parse(body)

    // Create room
    await createRoom(validatedData)

    const response: ResponseApi = {
      status: HTTP_STATUS_CODES.CREATED,
      message: "Room created successfully",
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation error",
        error: error.issues,
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.error("Room creation error:", error)

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to create room"
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
 * PATCH /api/rooms
 * Update room information
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = roomUpdateSchema.parse(body)

    // Update room
    await updateRoom(validatedData.id, validatedData)

    const response: ResponseApi = {
      status: HTTP_STATUS_CODES.OK,
      message: "Room updated successfully",
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation error",
        error: error.issues,
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.error("Room update error:", error)

    // Handle business logic errors
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
