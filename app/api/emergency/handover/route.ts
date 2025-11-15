import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateQueueNumber } from "@/lib/generators";

/**
 * Handover Schema
 * For transferring ER patients to other departments
 */
const handoverSchema = z.object({
    visitId: z.number().int().positive(),
    newVisitType: z.enum(["outpatient", "inpatient"]),
    poliId: z.number().int().positive().optional(), // Required for outpatient
    roomId: z.number().int().positive().optional(), // Required for inpatient
    doctorId: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/emergency/handover
 * Transfer ER patient to outpatient or inpatient care
 * Changes visit type while preserving patient history
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = handoverSchema.parse(body);

        // Check if visit exists and is an emergency visit
        const existingVisit = await db
            .select()
            .from(visits)
            .where(eq(visits.id, validatedData.visitId))
            .limit(1);

        if (existingVisit.length === 0) {
            return NextResponse.json({ error: "Kunjungan tidak ditemukan" }, { status: 404 });
        }

        if (existingVisit[0].visitType !== "emergency") {
            return NextResponse.json(
                { error: "Hanya kunjungan UGD yang dapat di-handover" },
                { status: 400 }
            );
        }

        // Validate required fields based on new visit type
        if (validatedData.newVisitType === "outpatient" && !validatedData.poliId) {
            return NextResponse.json(
                { error: "Poli ID wajib diisi untuk rawat jalan" },
                { status: 400 }
            );
        }

        if (validatedData.newVisitType === "inpatient" && !validatedData.roomId) {
            return NextResponse.json(
                { error: "Room ID wajib diisi untuk rawat inap" },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {
            visitType: validatedData.newVisitType,
            updatedAt: new Date(),
        };

        // Add type-specific fields
        if (validatedData.newVisitType === "outpatient") {
            // Generate queue number for outpatient
            const queueNumber = await generateQueueNumber(validatedData.poliId!);
            updateData.poliId = validatedData.poliId;
            updateData.queueNumber = queueNumber;
            updateData.doctorId = validatedData.doctorId || null;

            // Clear inpatient fields
            updateData.roomId = null;
            updateData.admissionDate = null;
        } else if (validatedData.newVisitType === "inpatient") {
            updateData.roomId = validatedData.roomId;
            updateData.admissionDate = new Date();
            updateData.doctorId = validatedData.doctorId || null;

            // Clear outpatient fields
            updateData.poliId = null;
            updateData.queueNumber = null;
        }

        // Add notes to existing notes if provided
        if (validatedData.notes) {
            const existingNotes = existingVisit[0].notes || "";
            updateData.notes = existingNotes
                ? `${existingNotes}\n\n[HANDOVER] ${validatedData.notes}`
                : `[HANDOVER] ${validatedData.notes}`;
        }

        // Update visit
        const updatedVisit = await db
            .update(visits)
            .set(updateData)
            .where(eq(visits.id, validatedData.visitId))
            .returning();

        return NextResponse.json({
            success: true,
            message: `Pasien berhasil di-handover ke ${validatedData.newVisitType === "outpatient" ? "Rawat Jalan" : "Rawat Inap"}`,
            data: updatedVisit[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validasi gagal", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Handover error:", error);
        return NextResponse.json({ error: "Gagal melakukan handover" }, { status: 500 });
    }
}
