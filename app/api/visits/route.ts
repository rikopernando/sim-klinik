import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visits, patients } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { generateVisitNumber, generateQueueNumber } from "@/lib/generators";

/**
 * Visit Registration Schema
 */
const visitSchema = z.object({
    patientId: z.number().int().positive(),
    visitType: z.enum(["outpatient", "inpatient", "emergency"]),
    poliId: z.number().int().positive().optional(),
    doctorId: z.string().optional(),
    triageStatus: z.enum(["red", "yellow", "green"]).optional(),
    chiefComplaint: z.string().optional(),
    roomId: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/visits
 * Create a new visit/registration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = visitSchema.parse(body);

        // Verify patient exists
        const patient = await db
            .select()
            .from(patients)
            .where(eq(patients.id, validatedData.patientId))
            .limit(1);

        if (patient.length === 0) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        // Generate visit number
        const visitNumber = await generateVisitNumber();

        // Generate queue number for outpatient visits
        let queueNumber = null;
        if (validatedData.visitType === "outpatient" && validatedData.poliId) {
            queueNumber = await generateQueueNumber(validatedData.poliId);
        }

        // Validate required fields based on visit type
        if (validatedData.visitType === "outpatient" && !validatedData.poliId) {
            return NextResponse.json(
                { error: "Poli ID is required for outpatient visits" },
                { status: 400 }
            );
        }

        if (validatedData.visitType === "emergency" && !validatedData.chiefComplaint) {
            return NextResponse.json(
                { error: "Chief complaint is required for emergency visits" },
                { status: 400 }
            );
        }

        if (validatedData.visitType === "inpatient" && !validatedData.roomId) {
            return NextResponse.json(
                { error: "Room ID is required for inpatient visits" },
                { status: 400 }
            );
        }

        // Create visit
        const newVisit = await db
            .insert(visits)
            .values({
                patientId: validatedData.patientId,
                visitType: validatedData.visitType,
                visitNumber,
                poliId: validatedData.poliId || null,
                doctorId: validatedData.doctorId || null,
                queueNumber,
                triageStatus: validatedData.triageStatus || null,
                chiefComplaint: validatedData.chiefComplaint || null,
                roomId: validatedData.roomId || null,
                admissionDate: validatedData.visitType === "inpatient" ? new Date() : null,
                status: "pending",
                arrivalTime: new Date(),
                notes: validatedData.notes || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Fetch complete visit with patient data
        const completeVisit = await db
            .select({
                visit: visits,
                patient: patients,
            })
            .from(visits)
            .leftJoin(patients, eq(visits.patientId, patients.id))
            .where(eq(visits.id, newVisit[0].id))
            .limit(1);

        return NextResponse.json(
            {
                success: true,
                message: "Visit registered successfully",
                data: completeVisit[0],
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

        console.error("Visit creation error:", error);
        return NextResponse.json(
            { error: "Failed to create visit" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/visits?poliId=X&status=pending
 * Get visits queue for a specific poli
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const poliId = searchParams.get("poliId");
        const status = searchParams.get("status") || "pending";
        const visitType = searchParams.get("visitType");

        // Build query conditions
        const conditions = [];

        if (poliId) {
            conditions.push(eq(visits.poliId, parseInt(poliId, 10)));
        }

        if (status) {
            conditions.push(eq(visits.status, status));
        }

        if (visitType) {
            conditions.push(eq(visits.visitType, visitType));
        }

        // Get today's date range for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        conditions.push(gte(visits.arrivalTime, today));
        conditions.push(lt(visits.arrivalTime, tomorrow));

        // Query visits with patient data
        const visitQueue = await db
            .select({
                visit: visits,
                patient: patients,
            })
            .from(visits)
            .leftJoin(patients, eq(visits.patientId, patients.id))
            .where(and(...conditions))
            .orderBy(visits.arrivalTime);

        return NextResponse.json({
            success: true,
            data: visitQueue,
            count: visitQueue.length,
        });
    } catch (error) {
        console.error("Visit queue fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch visit queue" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/visits/:id
 * Update visit status or information
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Visit ID is required" },
                { status: 400 }
            );
        }

        // Update visit
        const updatedVisit = await db
            .update(visits)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(visits.id, id))
            .returning();

        if (updatedVisit.length === 0) {
            return NextResponse.json(
                { error: "Visit not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Visit updated successfully",
            data: updatedVisit[0],
        });
    } catch (error) {
        console.error("Visit update error:", error);
        return NextResponse.json(
            { error: "Failed to update visit" },
            { status: 500 }
        );
    }
}
