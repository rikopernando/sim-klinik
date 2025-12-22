/**
 * Master Data - Rooms API
 * CRUD operations for room management
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { rooms } from "@/db/schema/inpatient"
import { roomCreateSchema } from "@/lib/validations/rooms"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { eq, ilike, and, count, desc } from "drizzle-orm"

/**
 * GET /api/master-data/rooms
 * Get all rooms with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const roomType = searchParams.get("roomType") || undefined
    const isActive = searchParams.get("isActive") || "active"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const offset = (page - 1) * limit

    // Build query conditions
    const conditions = []

    if (isActive) {
      conditions.push(eq(rooms.isActive, isActive))
    }

    if (roomType) {
      conditions.push(eq(rooms.roomType, roomType))
    }

    if (search) {
      conditions.push(ilike(rooms.roomNumber, `%${search}%`))
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const countQuery = whereCondition
      ? db.select({ count: count() }).from(rooms).where(whereCondition)
      : db.select({ count: count() }).from(rooms)

    const [{ count: total }] = await countQuery

    // Fetch paginated rooms
    let roomsQuery = db
      .select()
      .from(rooms)
      .orderBy(desc(rooms.createdAt))
      .limit(limit)
      .offset(offset)

    if (whereCondition) {
      roomsQuery = roomsQuery.where(whereCondition) as typeof roomsQuery
    }

    const allRooms = await roomsQuery

    const response: ResponseApi<typeof allRooms> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Rooms fetched successfully",
      data: allRooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching rooms:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to fetch rooms"
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
 * POST /api/master-data/rooms
 * Create a new room
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = roomCreateSchema.parse(body)

    // Check if room number already exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, validatedData.roomNumber))
      .limit(1)

    if (existingRoom.length > 0) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Room number already exists",
        error: "Room number must be unique",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    // Create room
    const [newRoom] = await db
      .insert(rooms)
      .values({
        roomNumber: validatedData.roomNumber,
        roomType: validatedData.roomType,
        bedCount: validatedData.bedCount,
        availableBeds: validatedData.bedCount, // Initially all beds are available
        floor: validatedData.floor || null,
        building: validatedData.building || null,
        dailyRate: validatedData.dailyRate,
        facilities: validatedData.facilities || null,
        status: "available",
        description: validatedData.description || null,
        isActive: "active",
      })
      .returning()

    const response: ResponseApi<typeof newRoom> = {
      status: HTTP_STATUS_CODES.CREATED,
      message: "Room created successfully",
      data: newRoom,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Validation error",
        error: error.issues,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    console.error("Room creation error:", error)

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
