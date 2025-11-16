/**
 * Room Management API
 * CRUD operations for hospital rooms
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { roomSchema, roomUpdateSchema } from "@/lib/inpatient/validation";
import { getAllRoomsWithOccupancy, createRoom, updateRoom } from "@/lib/inpatient/api-service";
import { APIResponse } from "@/types/inpatient";

/**
 * GET /api/rooms
 * Get all rooms with occupancy status
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status") || undefined;
        const roomType = searchParams.get("roomType") || undefined;

        const roomsWithOccupancy = await getAllRoomsWithOccupancy(status, roomType);

        const response: APIResponse = {
            success: true,
            data: roomsWithOccupancy,
            count: roomsWithOccupancy.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Rooms fetch error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch rooms",
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/rooms
 * Create a new room
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = roomSchema.parse(body);

        // Create room
        const newRoom = await createRoom(validatedData);

        const response: APIResponse = {
            success: true,
            message: "Room created successfully",
            data: newRoom,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validation error",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.error("Room creation error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create room",
        };

        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * PATCH /api/rooms
 * Update room information
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = roomUpdateSchema.parse(body);

        // Update room
        const updatedRoom = await updateRoom(validatedData.id, validatedData);

        const response: APIResponse = {
            success: true,
            message: "Room updated successfully",
            data: updatedRoom,
        };

        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validation error",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.error("Room update error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update room",
        };

        return NextResponse.json(response, { status: error instanceof Error && error.message === "Room not found" ? 404 : 500 });
    }
}
