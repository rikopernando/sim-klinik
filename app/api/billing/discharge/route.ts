/**
 * Patient Discharge API
 * Handles discharge summaries with billing gate check
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dischargeSummarySchema } from "@/lib/billing/validation";
import {
    canDischarge,
    createDischargeSummary,
    getDischargeSummary,
} from "@/lib/billing/api-service";
import { APIResponse } from "@/types/billing";

/**
 * GET /api/billing/discharge
 * Get discharge summary or check if patient can be discharged
 * Query params:
 * - visitId: number - visit ID
 * - check: boolean (optional) - check if can discharge (billing gate)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const visitId = searchParams.get("visitId");
        const check = searchParams.get("check");

        if (!visitId) {
            const response: APIResponse = {
                success: false,
                error: "Visit ID is required",
            };
            return NextResponse.json(response, { status: 400 });
        }

        const id = parseInt(visitId);
        if (isNaN(id)) {
            const response: APIResponse = {
                success: false,
                error: "Invalid visit ID",
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Check if can discharge (billing gate)
        if (check === "true") {
            const dischargeCheck = await canDischarge(id);

            const response: APIResponse = {
                success: true,
                data: dischargeCheck,
            };
            return NextResponse.json(response);
        }

        // Get discharge summary
        const summary = await getDischargeSummary(id);

        if (!summary) {
            const response: APIResponse = {
                success: false,
                error: "Discharge summary not found",
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: APIResponse = {
            success: true,
            data: summary,
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Discharge fetch error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch discharge data",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

/**
 * POST /api/billing/discharge
 * Create discharge summary (with billing gate check)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = dischargeSummarySchema.parse(body);

        // Create discharge summary (billing gate check inside)
        const summary = await createDischargeSummary(validatedData);

        const response: APIResponse = {
            success: true,
            message: "Patient discharged successfully",
            data: summary,
        };
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validation error",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        console.error("Discharge creation error:", error);

        const response: APIResponse = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create discharge summary",
        };
        return NextResponse.json(
            response,
            {
                status:
                    error instanceof Error &&
                    (error.message.includes("Cannot discharge") ||
                        error.message.includes("already exists"))
                        ? 400
                        : 500,
            }
        );
    }
}
