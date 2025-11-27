/**
 * Check Duplicate Batch API
 * Check if a batch number already exists for a specific drug
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drugInventory, drugs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { APIResponse } from "@/types/pharmacy";
import { calculateDaysUntilExpiry, getExpiryAlertLevel } from "@/lib/pharmacy/stock-utils";

/**
 * GET /api/pharmacy/inventory/[drugId]/check-batch?batchNumber=XXX
 * Check if batch number exists for the drug
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ drugId: string }> }
) {
    try {
        const { drugId } = await context.params;
        const drugIdNum = parseInt(drugId);

        if (isNaN(drugIdNum)) {
            const response: APIResponse = {
                success: false,
                error: "Invalid drug ID",
            };
            return NextResponse.json(response, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const batchNumber = searchParams.get("batchNumber");

        if (!batchNumber) {
            const response: APIResponse = {
                success: false,
                error: "Batch number is required",
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Check if batch exists for this drug
        const existingBatch = await db
            .select({
                inventory: drugInventory,
                drug: drugs,
            })
            .from(drugInventory)
            .innerJoin(drugs, eq(drugInventory.drugId, drugs.id))
            .where(
                and(
                    eq(drugInventory.drugId, drugIdNum),
                    eq(drugInventory.batchNumber, batchNumber)
                )
            )
            .limit(1);

        if (existingBatch.length === 0) {
            const response: APIResponse = {
                success: true,
                data: {
                    exists: false,
                },
            };
            return NextResponse.json(response);
        }

        // Batch exists, return details
        const { inventory, drug } = existingBatch[0];
        const daysUntilExpiry = calculateDaysUntilExpiry(inventory.expiryDate);
        const expiryAlertLevel = getExpiryAlertLevel(daysUntilExpiry);

        const response: APIResponse = {
            success: true,
            data: {
                exists: true,
                batch: {
                    ...inventory,
                    drug,
                    daysUntilExpiry,
                    expiryAlertLevel,
                },
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Check batch error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to check batch",
        };

        return NextResponse.json(response, { status: 500 });
    }
}
