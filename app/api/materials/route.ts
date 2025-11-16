/**
 * Medical Materials/Supplies Usage API
 * Track materials used for inpatient care (for billing purposes)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { materialUsage } from "@/db/schema/inpatient";
import { visits } from "@/db/schema/visits";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

/**
 * Material Usage Schema
 */
const materialUsageSchema = z.object({
    visitId: z.number().int().positive("Visit ID harus valid"),
    materialName: z.string().min(1, "Nama material wajib diisi"),
    quantity: z.number().int().positive("Jumlah harus positif"),
    unit: z.string().min(1, "Satuan wajib diisi"),
    unitPrice: z.string().min(1, "Harga satuan wajib diisi"),
    usedBy: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/materials
 * Record material usage
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = materialUsageSchema.parse(body);

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

        // Calculate total price
        const unitPrice = parseFloat(validatedData.unitPrice);
        const totalPrice = (unitPrice * validatedData.quantity).toFixed(2);

        // Create material usage record
        const newMaterialUsage = await db
            .insert(materialUsage)
            .values({
                visitId: validatedData.visitId,
                materialName: validatedData.materialName,
                quantity: validatedData.quantity,
                unit: validatedData.unit,
                unitPrice: validatedData.unitPrice,
                totalPrice,
                usedBy: validatedData.usedBy || null,
                usedAt: new Date(),
                notes: validatedData.notes || null,
                createdAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Material usage recorded successfully",
                data: newMaterialUsage[0],
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

        console.error("Material usage creation error:", error);
        return NextResponse.json(
            { error: "Failed to record material usage" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/materials?visitId=X
 * Get material usage for a visit
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

        // Get material usage records
        const materials = await db
            .select()
            .from(materialUsage)
            .where(eq(materialUsage.visitId, parseInt(visitId, 10)))
            .orderBy(desc(materialUsage.usedAt));

        // Calculate total cost
        const totalCost = materials.reduce((sum, item) => {
            return sum + parseFloat(item.totalPrice || "0");
        }, 0);

        return NextResponse.json({
            success: true,
            data: materials,
            count: materials.length,
            totalCost: totalCost.toFixed(2),
        });
    } catch (error) {
        console.error("Material usage fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch material usage" },
            { status: 500 }
        );
    }
}
