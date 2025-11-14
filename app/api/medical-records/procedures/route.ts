import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { procedures, medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Procedure Schema
 */
const procedureSchema = z.object({
    medicalRecordId: z.number().int().positive(),
    icd9Code: z.string().min(1),
    description: z.string().min(1),
    performedBy: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/medical-records/procedures
 * Add a procedure to a medical record
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = procedureSchema.parse(body);

        // Check if medical record exists and is not locked
        const record = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.id, validatedData.medicalRecordId))
            .limit(1);

        if (record.length === 0) {
            return NextResponse.json(
                { error: "Medical record not found" },
                { status: 404 }
            );
        }

        if (record[0].isLocked) {
            return NextResponse.json(
                { error: "Cannot add procedure to locked medical record" },
                { status: 403 }
            );
        }

        // Add procedure
        const newProcedure = await db
            .insert(procedures)
            .values({
                medicalRecordId: validatedData.medicalRecordId,
                icd9Code: validatedData.icd9Code,
                description: validatedData.description,
                performedBy: validatedData.performedBy || null,
                performedAt: new Date(),
                notes: validatedData.notes || null,
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Procedure added successfully",
                data: newProcedure[0],
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

        console.error("Procedure creation error:", error);
        return NextResponse.json(
            { error: "Failed to add procedure" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/medical-records/procedures?id=X
 * Remove a procedure
 */
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Procedure ID is required" },
                { status: 400 }
            );
        }

        // Get procedure and check if medical record is locked
        const procedure = await db
            .select({
                procedure: procedures,
                medicalRecord: medicalRecords,
            })
            .from(procedures)
            .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
            .where(eq(procedures.id, parseInt(id, 10)))
            .limit(1);

        if (procedure.length === 0) {
            return NextResponse.json(
                { error: "Procedure not found" },
                { status: 404 }
            );
        }

        if (procedure[0].medicalRecord.isLocked) {
            return NextResponse.json(
                { error: "Cannot delete procedure from locked medical record" },
                { status: 403 }
            );
        }

        // Delete procedure
        await db.delete(procedures).where(eq(procedures.id, parseInt(id, 10)));

        return NextResponse.json({
            success: true,
            message: "Procedure deleted successfully",
        });
    } catch (error) {
        console.error("Procedure deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete procedure" },
            { status: 500 }
        );
    }
}
