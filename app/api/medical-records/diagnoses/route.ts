import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diagnoses, medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Diagnosis Schema
 */
const diagnosisSchema = z.object({
    medicalRecordId: z.number().int().positive(),
    icd10Code: z.string().min(1),
    description: z.string().min(1),
    diagnosisType: z.enum(["primary", "secondary"]).default("primary"),
});

/**
 * POST /api/medical-records/diagnoses
 * Add a diagnosis to a medical record
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = diagnosisSchema.parse(body);

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
                { error: "Cannot add diagnosis to locked medical record" },
                { status: 403 }
            );
        }

        // Add diagnosis
        const newDiagnosis = await db
            .insert(diagnoses)
            .values({
                medicalRecordId: validatedData.medicalRecordId,
                icd10Code: validatedData.icd10Code,
                description: validatedData.description,
                diagnosisType: validatedData.diagnosisType,
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Diagnosis added successfully",
                data: newDiagnosis[0],
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

        console.error("Diagnosis creation error:", error);
        return NextResponse.json(
            { error: "Failed to add diagnosis" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/medical-records/diagnoses?id=X
 * Remove a diagnosis
 */
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Diagnosis ID is required" },
                { status: 400 }
            );
        }

        // Get diagnosis and check if medical record is locked
        const diagnosis = await db
            .select({
                diagnosis: diagnoses,
                medicalRecord: medicalRecords,
            })
            .from(diagnoses)
            .innerJoin(medicalRecords, eq(diagnoses.medicalRecordId, medicalRecords.id))
            .where(eq(diagnoses.id, parseInt(id, 10)))
            .limit(1);

        if (diagnosis.length === 0) {
            return NextResponse.json(
                { error: "Diagnosis not found" },
                { status: 404 }
            );
        }

        if (diagnosis[0].medicalRecord.isLocked) {
            return NextResponse.json(
                { error: "Cannot delete diagnosis from locked medical record" },
                { status: 403 }
            );
        }

        // Delete diagnosis
        await db.delete(diagnoses).where(eq(diagnoses.id, parseInt(id, 10)));

        return NextResponse.json({
            success: true,
            message: "Diagnosis deleted successfully",
        });
    } catch (error) {
        console.error("Diagnosis deletion error:", error);
        return NextResponse.json(
            { error: "Failed to delete diagnosis" },
            { status: 500 }
        );
    }
}
