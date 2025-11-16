/**
 * Room Management API
 * CRUD operations for hospital rooms
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, bedAssignments } from "@/db/schema/inpatient";
import { visits } from "@/db/schema/visits";
import { patients } from "@/db/schema/patients";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

/**
 * Room Schema
 */
const roomSchema = z.object({
    roomNumber: z.string().min(1, "Nomor kamar wajib diisi"),
    roomType: z.string().min(1, "Tipe kamar wajib diisi"),
    bedCount: z.number().int().positive("Jumlah bed harus positif"),
    floor: z.string().optional(),
    building: z.string().optional(),
    dailyRate: z.string().min(1, "Tarif harian wajib diisi"),
    facilities: z.string().optional(),
    description: z.string().optional(),
});

/**
 * GET /api/rooms
 * Get all rooms with occupancy status
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status");
        const roomType = searchParams.get("roomType");

        // Build query conditions
        const conditions = [];

        if (status) {
            conditions.push(eq(rooms.status, status));
        }

        if (roomType) {
            conditions.push(eq(rooms.roomType, roomType));
        }

        // Get all rooms
        const allRooms = await db
            .select()
            .from(rooms)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(rooms.roomNumber);

        // Get active bed assignments
        const activeAssignments = await db
            .select({
                assignment: bedAssignments,
                visit: visits,
                patient: patients,
            })
            .from(bedAssignments)
            .leftJoin(visits, eq(bedAssignments.visitId, visits.id))
            .leftJoin(patients, eq(visits.patientId, patients.id))
            .where(isNull(bedAssignments.dischargedAt));

        // Enrich rooms with occupancy data
        const roomsWithOccupancy = allRooms.map((room) => {
            const assignmentsInRoom = activeAssignments.filter(
                (a) => a.assignment.roomId === room.id
            );

            return {
                ...room,
                occupiedBeds: assignmentsInRoom.length,
                assignments: assignmentsInRoom,
                occupancyRate: room.bedCount > 0
                    ? Math.round((assignmentsInRoom.length / room.bedCount) * 100)
                    : 0,
            };
        });

        return NextResponse.json({
            success: true,
            data: roomsWithOccupancy,
            count: roomsWithOccupancy.length,
        });
    } catch (error) {
        console.error("Rooms fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
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
        const newRoom = await db
            .insert(rooms)
            .values({
                roomNumber: validatedData.roomNumber,
                roomType: validatedData.roomType,
                bedCount: validatedData.bedCount,
                availableBeds: validatedData.bedCount, // Initially all beds available
                floor: validatedData.floor || null,
                building: validatedData.building || null,
                dailyRate: validatedData.dailyRate,
                facilities: validatedData.facilities || null,
                status: "available",
                description: validatedData.description || null,
                isActive: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Room created successfully",
                data: newRoom[0],
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Room creation error:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/rooms
 * Update room information
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Room ID is required" },
                { status: 400 }
            );
        }

        // Update room
        const updatedRoom = await db
            .update(rooms)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(rooms.id, id))
            .returning();

        if (updatedRoom.length === 0) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Room updated successfully",
            data: updatedRoom[0],
        });
    } catch (error) {
        console.error("Room update error:", error);
        return NextResponse.json(
            { error: "Failed to update room" },
            { status: 500 }
        );
    }
}
