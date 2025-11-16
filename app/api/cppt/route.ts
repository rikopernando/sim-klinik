/**
 * CPPT API
 * Catatan Perkembangan Pasien Terintegrasi (Integrated Progress Notes)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cppt } from "@/db/schema/medical-records";
import { visits } from "@/db/schema/visits";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

/**
 * CPPT Schema
 */
const cpptSchema = z.object({
    visitId: z.number().int().positive("Visit ID harus valid"),
    authorId: z.string().min(1, "Author ID is required"),
    authorRole: z.enum(["doctor", "nurse"], {
        required_error: "Author role is required",
    }),
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
    progressNote: z.string().min(1, "Progress note is required"),
    instructions: z.string().optional(),
});

/**
 * POST /api/cppt
 * Create new CPPT entry
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = cpptSchema.parse(body);

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

        // Create CPPT entry
        const newCPPT = await db
            .insert(cppt)
            .values({
                visitId: validatedData.visitId,
                authorId: validatedData.authorId,
                authorRole: validatedData.authorRole,
                subjective: validatedData.subjective || null,
                objective: validatedData.objective || null,
                assessment: validatedData.assessment || null,
                plan: validatedData.plan || null,
                progressNote: validatedData.progressNote,
                instructions: validatedData.instructions || null,
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "CPPT entry created successfully",
                data: newCPPT[0],
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

        console.error("CPPT creation error:", error);
        return NextResponse.json(
            { error: "Failed to create CPPT entry" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/cppt?visitId=X
 * Get CPPT entries for a visit
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const visitId = searchParams.get("visitId");

        if (!visitId) {
            return NextResponse.json(
                { error: "Visit ID is required" },
                { status: 400 }
            );
        }

        // Get CPPT entries
        const entries = await db
            .select()
            .from(cppt)
            .where(eq(cppt.visitId, parseInt(visitId, 10)))
            .orderBy(desc(cppt.createdAt));

        return NextResponse.json({
            success: true,
            data: entries,
            count: entries.length,
        });
    } catch (error) {
        console.error("CPPT fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch CPPT entries" },
            { status: 500 }
        );
    }
}
