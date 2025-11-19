/**
 * Patient Handover API
 * Transfers ER patients to other departments (outpatient/inpatient)
 * H.1.3 Integration: UGD → RJ/RI handover workflow with visit status validation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handoverSchema } from "@/lib/emergency/validation";
import { performHandover } from "@/lib/emergency/api-service";
import { APIResponse } from "@/types/emergency";
import { withRBAC } from "@/lib/rbac/middleware";

/**
 * POST /api/emergency/handover
 * Transfer ER patient to outpatient or inpatient care
 * Changes visit type while preserving patient history
 * Requires: visits:write permission
 */
export const POST = withRBAC(
    async (request: NextRequest, { user }) => {
        try {
            // Parse request body
            const body = await request.json();

            // Validate input
            const validatedData = handoverSchema.parse(body);

            // Perform handover (includes visit status validation)
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

            console.log(`[Handover] Visit ${validatedData.visitId} transferred to ${departmentName} by ${user.id}`);

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
    },
    { permissions: ["visits:write"] }
);
