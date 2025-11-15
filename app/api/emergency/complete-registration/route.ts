import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Complete Patient Registration Schema
 * For updating patient data after quick ER registration
 */
const completePatientSchema = z.object({
    patientId: z.number().int().positive(),
    nik: z.string().length(16, "NIK harus 16 digit"),
    address: z.string().min(1, "Alamat wajib diisi"),
    birthDate: z.string(),
    gender: z.enum(["male", "female"]),
    phone: z.string().optional(),
    insuranceType: z.enum(["bpjs", "insurance", "general"]),
    insuranceNumber: z.string().optional(),
});

/**
 * PATCH /api/emergency/complete-registration
 * Update patient data from quick registration to complete data
 * Used after initial ER triage when patient condition is stable
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = completePatientSchema.parse(body);

        // Check if patient exists
        const existingPatient = await db
            .select()
            .from(patients)
            .where(eq(patients.id, validatedData.patientId))
            .limit(1);

        if (existingPatient.length === 0) {
            return NextResponse.json(
                { error: "Pasien tidak ditemukan" },
                { status: 404 }
            );
        }

        // Update patient with complete data
        const updatedPatient = await db
            .update(patients)
            .set({
                nik: validatedData.nik,
                address: validatedData.address,
                birthDate: new Date(validatedData.birthDate),
                gender: validatedData.gender,
                phone: validatedData.phone || null,
                insuranceType: validatedData.insuranceType,
                insuranceNumber: validatedData.insuranceNumber || null,
                updatedAt: new Date(),
            })
            .where(eq(patients.id, validatedData.patientId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Data pasien berhasil dilengkapi",
            data: updatedPatient[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validasi gagal", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Complete patient registration error:", error);
        return NextResponse.json(
            { error: "Gagal melengkapi data pasien" },
            { status: 500 }
        );
    }
}
