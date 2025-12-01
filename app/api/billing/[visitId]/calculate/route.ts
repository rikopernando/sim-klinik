/**
 * Calculate Billing API
 * POST /api/billing/[visitId]/calculate
 * Creates or updates billing record with cost calculation
 */

import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateBilling } from "@/lib/services/billing.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ visitId: string }> }
) {
    try {
        // Get authenticated user
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { visitId } = await context.params;
        const visitIdNum = parseInt(visitId);

        if (isNaN(visitIdNum)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid visit ID",
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { discount, discountPercentage, insuranceCoverage } = body;

        const billingId = await createOrUpdateBilling(visitIdNum, session.user.id, {
            discount: discount ? parseFloat(discount) : undefined,
            discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
            insuranceCoverage: insuranceCoverage ? parseFloat(insuranceCoverage) : undefined,
        });

        return NextResponse.json({
            success: true,
            data: {
                billingId,
                message: "Billing calculated successfully",
            },
        });
    } catch (error) {
        console.error("Calculate billing error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to calculate billing",
            },
            { status: 500 }
        );
    }
}
