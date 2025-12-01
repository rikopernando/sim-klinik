/**
 * Billing Queue API
 * GET /api/billing/queue
 * Returns visits ready for billing (RME locked, not fully paid)
 */

import { NextResponse } from "next/server";
import { getVisitsReadyForBilling } from "@/lib/services/billing.service";

export async function GET() {
    try {
        const visits = await getVisitsReadyForBilling();

        return NextResponse.json({
            success: true,
            data: visits,
        });
    } catch (error) {
        console.error("Billing queue error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch billing queue",
            },
            { status: 500 }
        );
    }
}
