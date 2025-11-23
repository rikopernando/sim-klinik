import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords, visits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withRBAC } from "@/lib/rbac/middleware";
import { isValidStatusTransition, VisitStatus } from "@/types/visit-status";

/**
 * Lock Medical Record Schema
 */
const lockSchema = z.object({
    id: z.number().int().positive(),
});

/**
 * POST /api/medical-records/lock
 * Lock a medical record (make it immutable)
 * Automatically updates visit status to "ready_for_billing"
 * Requires: medical_records:lock permission
 */
export const POST = withRBAC(
    async (request: NextRequest, { user }) => {
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

            const medicalRecord = existing[0];

            // Get the associated visit
            const [visit] = await db
                .select()
                .from(visits)
                .where(eq(visits.id, medicalRecord.visitId))
                .limit(1);

            if (!visit) {
                return NextResponse.json(
                    { error: "Associated visit not found" },
                    { status: 404 }
                );
            }

            // Validate visit status transition to ready_for_billing
            const currentStatus = visit.status as VisitStatus;
            const finalStatus: VisitStatus = "ready_for_billing";

            // Can transition from in_examination or examined directly to ready_for_billing
            if (!isValidStatusTransition(currentStatus, finalStatus)) {
                return NextResponse.json(
                    {
                        error: "Cannot lock medical record",
                        message: `Visit status "${currentStatus}" cannot transition to "ready_for_billing". Visit must be in "in_examination" or "examined" status.`,
                        currentStatus,
                    },
                    { status: 400 }
                );
            }

            // Lock the medical record
            const [lockedRecord] = await db
                .update(medicalRecords)
                .set({
                    isLocked: true,
                    isDraft: false,
                    lockedAt: new Date(),
                    lockedBy: user.id,
                    updatedAt: new Date(),
                })
                .where(eq(medicalRecords.id, validatedData.id))
                .returning();

            // Update visit status to ready_for_billing (H.1.2 integration)
            const [updatedVisit] = await db
                .update(visits)
                .set({
                    status: finalStatus,
                    updatedAt: new Date(),
                })
                .where(eq(visits.id, medicalRecord.visitId))
                .returning();

            return NextResponse.json({
                success: true,
                message: "Medical record locked successfully. Visit is now ready for billing.",
                data: {
                    medicalRecord: lockedRecord,
                    visit: {
                        id: updatedVisit.id,
                        visitNumber: updatedVisit.visitNumber,
                        previousStatus: currentStatus,
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

            console.error("Medical record lock error:", error);
            return NextResponse.json(
                { error: "Failed to lock medical record" },
                { status: 500 }
            );
        }
    },
    { permissions: ["medical_records:lock"] }
);
