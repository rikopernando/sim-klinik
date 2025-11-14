import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords, diagnoses, procedures, prescriptions, visits } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

/**
 * Medical Record Schema
 */
const medicalRecordSchema = z.object({
    visitId: z.number().int().positive(),
    doctorId: z.string(),
    soapSubjective: z.string().optional(),
    soapObjective: z.string().optional(),
    soapAssessment: z.string().optional(),
    soapPlan: z.string().optional(),
    physicalExam: z.string().optional(),
    laboratoryResults: z.string().optional(),
    radiologyResults: z.string().optional(),
    isDraft: z.boolean().default(true),
});

/**
 * POST /api/medical-records
 * Create a new medical record
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = medicalRecordSchema.parse(body);

        // Verify visit exists and doesn't already have a medical record
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

        // Check if medical record already exists for this visit
        const existingRecord = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.visitId, validatedData.visitId))
            .limit(1);

        if (existingRecord.length > 0) {
            return NextResponse.json(
                { error: "Medical record already exists for this visit" },
                { status: 400 }
            );
        }

        // Create medical record
        const newRecord = await db
            .insert(medicalRecords)
            .values({
                visitId: validatedData.visitId,
                doctorId: validatedData.doctorId,
                soapSubjective: validatedData.soapSubjective || null,
                soapObjective: validatedData.soapObjective || null,
                soapAssessment: validatedData.soapAssessment || null,
                soapPlan: validatedData.soapPlan || null,
                physicalExam: validatedData.physicalExam || null,
                laboratoryResults: validatedData.laboratoryResults || null,
                radiologyResults: validatedData.radiologyResults || null,
                isDraft: validatedData.isDraft,
                isLocked: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Medical record created successfully",
                data: newRecord[0],
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

        console.error("Medical record creation error:", error);
        return NextResponse.json(
            { error: "Failed to create medical record" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/medical-records?visitId=X
 * Get medical record by visit ID
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const visitId = searchParams.get("visitId");
        const patientId = searchParams.get("patientId");

        if (visitId) {
            // Get medical record for specific visit with all related data
            const record = await db
                .select()
                .from(medicalRecords)
                .where(eq(medicalRecords.visitId, parseInt(visitId, 10)))
                .limit(1);

            if (record.length === 0) {
                return NextResponse.json(
                    { error: "Medical record not found" },
                    { status: 404 }
                );
            }

            // Get diagnoses
            const diagnosisList = await db
                .select()
                .from(diagnoses)
                .where(eq(diagnoses.medicalRecordId, record[0].id));

            // Get procedures
            const proceduresList = await db
                .select()
                .from(procedures)
                .where(eq(procedures.medicalRecordId, record[0].id));

            // Get prescriptions
            const prescriptionsList = await db
                .select()
                .from(prescriptions)
                .where(eq(prescriptions.medicalRecordId, record[0].id));

            return NextResponse.json({
                success: true,
                data: {
                    medicalRecord: record[0],
                    diagnoses: diagnosisList,
                    procedures: proceduresList,
                    prescriptions: prescriptionsList,
                },
            });
        }

        if (patientId) {
            // Get all medical records for a patient (via visits)
            const records = await db
                .select({
                    medicalRecord: medicalRecords,
                    visit: visits,
                })
                .from(medicalRecords)
                .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
                .where(eq(visits.patientId, parseInt(patientId, 10)))
                .orderBy(medicalRecords.createdAt);

            return NextResponse.json({
                success: true,
                data: records,
                count: records.length,
            });
        }

        return NextResponse.json(
            { error: "visitId or patientId parameter is required" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Medical record fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch medical record" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/medical-records
 * Update medical record
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Medical record ID is required" },
                { status: 400 }
            );
        }

        // Check if record exists and is not locked
        const existing = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.id, id))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Medical record not found" },
                { status: 404 }
            );
        }

        if (existing[0].isLocked) {
            return NextResponse.json(
                { error: "Cannot update locked medical record" },
                { status: 403 }
            );
        }

        // Update medical record
        const updatedRecord = await db
            .update(medicalRecords)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(medicalRecords.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Medical record updated successfully",
            data: updatedRecord[0],
        });
    } catch (error) {
        console.error("Medical record update error:", error);
        return NextResponse.json(
            { error: "Failed to update medical record" },
            { status: 500 }
        );
    }
}
