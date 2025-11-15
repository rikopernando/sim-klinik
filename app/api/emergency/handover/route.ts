/**
 * Patient Handover API
 * Transfers ER patients to other departments (outpatient/inpatient)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handoverSchema } from "@/lib/emergency/validation";
import { performHandover } from "@/lib/emergency/api-service";
import { APIResponse } from "@/types/emergency";

/**
 * POST /api/emergency/handover
 * Transfer ER patient to outpatient or inpatient care
 * Changes visit type while preserving patient history
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validatedData = handoverSchema.parse(body);

        // Perform handover
        const updatedVisit = await performHandover(validatedData);

        // Determine success message
        const departmentName =
            validatedData.newVisitType === "outpatient" ? "Rawat Jalan" : "Rawat Inap";

        // Return success response
        const response: APIResponse = {
            success: true,
            message: `Pasien berhasil di-handover ke ${departmentName}`,
            data: updatedVisit,
        };

        return NextResponse.json(response);
    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            const response: APIResponse = {
                success: false,
                error: "Validasi gagal",
                details: error.issues,
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Handle application errors
        if (error instanceof Error) {
            console.error("Handover error:", error);
            const response: APIResponse = {
                success: false,
                error: error.message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Handle unknown errors
        console.error("Unknown error in handover:", error);
        const response: APIResponse = {
            success: false,
            error: "Gagal melakukan handover",
        };
        return NextResponse.json(response, { status: 500 });
    }
}
