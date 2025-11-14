import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { prescriptions, medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Prescription Schema
 */
const prescriptionSchema = z.object({
    medicalRecordId: z.number().int().positive(),
    drugId: z.number().int().positive(),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().optional(),
    quantity: z.number().int().positive(),
    instructions: z.string().optional(),
    route: z.string().optional(),
});

/**
 * POST /api/medical-records/prescriptions
 * Add a prescription to a medical record
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = prescriptionSchema.parse(body);

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
                { error: "Cannot add prescription to locked medical record" },
                { status: 403 }
            );
        }

        // Add prescription
        const newPrescription = await db
            .insert(prescriptions)
            .values({
                medicalRecordId: validatedData.medicalRecordId,
                drugId: validatedData.drugId,
                dosage: validatedData.dosage,
                frequency: validatedData.frequency,
                duration: validatedData.duration || null,
                quantity: validatedData.quantity,
                instructions: validatedData.instructions || null,
                route: validatedData.route || null,
                isFulfilled: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Prescription added successfully",
                data: newPrescription[0],
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

        console.error("Prescription creation error:", error);
        return NextResponse.json(
            { error: "Failed to add prescription" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/medical-records/prescriptions?id=X
 * Remove a prescription
 */
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Prescription ID is required" },
                { status: 400 }
            );
        }

        // Get prescription and check if medical record is locked
        const prescription = await db
            .select({
                prescription: prescriptions,
                medicalRecord: medicalRecords,
            })
            .from(prescriptions)
            .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
            .where(eq(prescriptions.id, parseInt(id, 10)))
            .limit(1);

        if (prescription.length === 0) {
            return NextResponse.json(
                { error: "Prescription not found" },
                { status: 404 }
            );
        }

        if (prescription[0].medicalRecord.isLocked) {
            return NextResponse.json(
                { error: "Cannot delete prescription from locked medical record" },
                { status: 403 }
            );
        }

        if (prescription[0].prescription.isFulfilled) {
            return NextResponse.json(
                { error: "Cannot delete fulfilled prescription" },
                { status: 403 }
            );
        }

        // Delete prescription
        await db.delete(prescriptions).where(eq(prescriptions.id, parseInt(id, 10)));

        return NextResponse.json({
            success: true,
            message: "Prescription deleted successfully",
        });
    } catch (error) {
        console.error("Prescription deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete prescription" },
            { status: 500 }
        );
    }
}
