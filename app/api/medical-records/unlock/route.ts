import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords, visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withRBAC } from "@/lib/rbac/middleware";
import { VisitStatus } from "@/types/visit-status";

const unlockSchema = z.object({
    id: z.number().int().positive(),
});

export const POST = withRBAC(
    async (request: NextRequest) => {
        try {
            const body = await request.json();
            const validatedData = unlockSchema.parse(body);

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

            if (!existing[0].isLocked) {
                return NextResponse.json(
                    { error: "Medical record is not locked" },
                    { status: 400 }
                );
            }

            const medicalRecord = existing[0];

            // Unlock the medical record
            const [unlockedRecord] = await db
                .update(medicalRecords)
                .set({
                    isLocked: false,
                    isDraft: true,
                    lockedAt: null,
                    lockedBy: null,
                    updatedAt: new Date(),
                })
                .where(eq(medicalRecords.id, validatedData.id))
                .returning();

            // Revert visit status back to in_examination
            // This allows the record to be locked again later
            const newStatus: VisitStatus = "in_examination";
            const [updatedVisit] = await db
                .update(visits)
                .set({
                    status: newStatus,
                    updatedAt: new Date(),
                })
                .where(eq(visits.id, medicalRecord.visitId))
                .returning();

            return NextResponse.json({
                success: true,
                message: "Medical record unlocked successfully. Visit status reverted to in_examination.",
                data: {
                    medicalRecord: unlockedRecord,
                    visit: {
                        id: updatedVisit.id,
                        visitNumber: updatedVisit.visitNumber,
                        newStatus: updatedVisit.status,
                    },
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: "Validation error", details: error.issues },
                    { status: 400 }
                );
            }

            console.error("Medical record unlock error:", error);
            return NextResponse.json(
                { error: "Failed to unlock medical record" },
                { status: 500 }
            );
        }
    },
    { permissions: ["medical_records:lock"] }
);
