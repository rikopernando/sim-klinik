import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Lock Medical Record Schema
 */
const lockSchema = z.object({
    id: z.number().int().positive(),
    userId: z.string(), // The user who is locking the record
});

/**
 * POST /api/medical-records/lock
 * Lock a medical record (make it immutable)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = lockSchema.parse(body);

        // Check if record exists
        const existing = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.id, validatedData.id))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Medical record not found" },
                { status: 404 }
            );
        }

        if (existing[0].isLocked) {
            return NextResponse.json(
                { error: "Medical record is already locked" },
                { status: 400 }
            );
        }

        // Lock the medical record
        const lockedRecord = await db
            .update(medicalRecords)
            .set({
                isLocked: true,
                isDraft: false,
                lockedAt: new Date(),
                lockedBy: validatedData.userId,
                updatedAt: new Date(),
            })
            .where(eq(medicalRecords.id, validatedData.id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Medical record locked successfully",
            data: lockedRecord[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Medical record lock error:", error);
        return NextResponse.json(
            { error: "Failed to lock medical record" },
            { status: 500 }
        );
    }
}
