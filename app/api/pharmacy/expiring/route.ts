/**
 * Expiry Notification API
 * Get drugs that are expiring soon (< 30 days)
 */

import { NextRequest, NextResponse } from "next/server";
import { getExpiringDrugs } from "@/lib/pharmacy/api-service";
import { APIResponse } from "@/types/pharmacy";

/**
 * GET /api/pharmacy/expiring
 * Get all drugs with expiry date < 30 days
 * Returns drugs sorted by expiry date (earliest first)
 */
export async function GET(request: NextRequest) {
    try {
        const expiringDrugs = await getExpiringDrugs();

        // Group by alert level for better UX
        const expired = expiringDrugs.filter((d) => d.expiryAlertLevel === "expired");
        const expiringSoon = expiringDrugs.filter((d) => d.expiryAlertLevel === "expiring_soon");
        const warning = expiringDrugs.filter((d) => d.expiryAlertLevel === "warning");

        const response: APIResponse = {
            success: true,
            data: {
                all: expiringDrugs,
                expired,
                expiringSoon,
                warning,
            },
            count: expiringDrugs.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Expiring drugs fetch error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch expiring drugs",
        };

        return NextResponse.json(response, { status: 500 });
    }
}
