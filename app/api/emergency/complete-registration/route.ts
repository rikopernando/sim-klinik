/**
 * Complete Patient Registration API
 * Updates patient data from quick ER registration to full registration
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeRegistrationSchema } from "@/lib/emergency/validation";
import { completePatientRegistration } from "@/lib/emergency/api-service";
import { APIResponse } from "@/types/emergency";

/**
 * PATCH /api/emergency/complete-registration
 * Update patient data from quick registration to complete data
 * Used after initial ER triage when patient condition is stable
 */
export async function PATCH(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate input
        const validatedData = completeRegistrationSchema.parse(body);

        // Update patient data
        const updatedPatient = await completePatientRegistration(validatedData);

        // Return success response
        const response: APIResponse = {
            success: true,
            message: "Data pasien berhasil dilengkapi",
            data: updatedPatient,
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
            console.error("Complete patient registration error:", error);
            const response: APIResponse = {
                success: false,
                error: error.message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Handle unknown errors
        console.error("Unknown error in complete registration:", error);
        const response: APIResponse = {
            success: false,
            error: "Gagal melengkapi data pasien",
        };
        return NextResponse.json(response, { status: 500 });
    }
}
