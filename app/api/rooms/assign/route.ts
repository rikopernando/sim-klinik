/**
 * Bed Assignment API
 * Assign and discharge patients from beds
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, bedAssignments } from "@/db/schema/inpatient";
import { visits } from "@/db/schema/visits";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

/**
 * Bed Assignment Schema
 */
const assignmentSchema = z.object({
    visitId: z.number().int().positive("Visit ID harus valid"),
    roomId: z.number().int().positive("Room ID harus valid"),
    bedNumber: z.string().min(1, "Nomor bed wajib diisi"),
    notes: z.string().optional(),
});

/**
 * POST /api/rooms/assign
 * Assign patient to a bed
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = assignmentSchema.parse(body);

        // Check if visit exists
        const visit = await db
            .select()
            .from(visits)
            .where(eq(visits.id, validatedData.visitId))
            .limit(1);

        if (visit.length === 0) {
            return NextResponse.json(
                { error: "Visit not found" },
                { status: 404 }
            );
        }

        // Check if room exists and has available beds
        const room = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, validatedData.roomId))
            .limit(1);

        if (room.length === 0) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        if (room[0].availableBeds <= 0) {
            return NextResponse.json(
                { error: "No available beds in this room" },
                { status: 400 }
            );
        }

        // Check if bed is already occupied
        const existingAssignment = await db
            .select()
            .from(bedAssignments)
            .where(
                and(
                    eq(bedAssignments.roomId, validatedData.roomId),
                    eq(bedAssignments.bedNumber, validatedData.bedNumber),
                    isNull(bedAssignments.dischargedAt)
                )
            )
            .limit(1);

        if (existingAssignment.length > 0) {
            return NextResponse.json(
                { error: "Bed is already occupied" },
                { status: 400 }
            );
        }

        // Create bed assignment
        const newAssignment = await db
            .insert(bedAssignments)
            .values({
                visitId: validatedData.visitId,
                roomId: validatedData.roomId,
                bedNumber: validatedData.bedNumber,
                assignedAt: new Date(),
                notes: validatedData.notes || null,
                createdAt: new Date(),
            })
            .returning();

        // Update room available beds count
        await db
            .update(rooms)
            .set({
                availableBeds: room[0].availableBeds - 1,
                status: room[0].availableBeds - 1 === 0 ? "occupied" : room[0].status,
                updatedAt: new Date(),
            })
            .where(eq(rooms.id, validatedData.roomId));

        // Update visit with room ID
        await db
            .update(visits)
            .set({
                roomId: validatedData.roomId,
                admissionDate: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(visits.id, validatedData.visitId));

        return NextResponse.json(
            {
                success: true,
                message: "Patient assigned to bed successfully",
                data: newAssignment[0],
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

        console.error("Bed assignment error:", error);
        return NextResponse.json(
            { error: "Failed to assign bed" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/rooms/assign
 * Discharge patient from bed
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { assignmentId } = body;

        if (!assignmentId) {
            return NextResponse.json(
                { error: "Assignment ID is required" },
                { status: 400 }
            );
        }

        // Get assignment details
        const assignment = await db
            .select()
            .from(bedAssignments)
            .where(eq(bedAssignments.id, assignmentId))
            .limit(1);

        if (assignment.length === 0) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        if (assignment[0].dischargedAt) {
            return NextResponse.json(
                { error: "Patient already discharged from this bed" },
                { status: 400 }
            );
        }

        // Update assignment with discharge time
        await db
            .update(bedAssignments)
            .set({
                dischargedAt: new Date(),
            })
            .where(eq(bedAssignments.id, assignmentId));

        // Get room info
        const room = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, assignment[0].roomId))
            .limit(1);

        if (room.length > 0) {
            // Update room available beds count
            await db
                .update(rooms)
                .set({
                    availableBeds: room[0].availableBeds + 1,
                    status: "available",
                    updatedAt: new Date(),
                })
                .where(eq(rooms.id, assignment[0].roomId));
        }

        return NextResponse.json({
            success: true,
            message: "Patient discharged from bed successfully",
        });
    } catch (error) {
        console.error("Bed discharge error:", error);
        return NextResponse.json(
            { error: "Failed to discharge from bed" },
            { status: 500 }
        );
    }
}
