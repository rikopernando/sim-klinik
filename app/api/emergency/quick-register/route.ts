import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visits, patients } from "@/db/schema";
import { z } from "zod";
import { generateMRNumber, generateVisitNumber } from "@/lib/generators";

/**
 * Quick ER Registration Schema
 * Minimal data required for emergency situations
 */
const quickERSchema = z.object({
    // Patient info (minimal for quick registration)
    name: z.string().min(1, "Nama pasien wajib diisi"),
    chiefComplaint: z.string().min(1, "Keluhan utama wajib diisi"),
    triageStatus: z.enum(["red", "yellow", "green"]),

    // Optional fields that can be filled later
    nik: z.string().optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
    birthDate: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/emergency/quick-register
 * Quick emergency registration - creates both patient and visit in one go
 * Used for urgent cases where we need minimal data to start treatment
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = quickERSchema.parse(body);

        // Generate MR number for new patient
        const mrNumber = await generateMRNumber();

        // Create patient record (with minimal data)
        const newPatient = await db
            .insert(patients)
            .values({
                mrNumber,
                name: validatedData.name,
                nik: validatedData.nik || null,
                phone: validatedData.phone || null,
                gender: validatedData.gender || null,
                birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
                address: null, // Will be filled later
                insuranceType: "general", // Default to general/umum
                insuranceNumber: null,
                isActive: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Generate visit number
        const visitNumber = await generateVisitNumber();

        // Create emergency visit
        const newVisit = await db
            .insert(visits)
            .values({
                patientId: newPatient[0].id,
                visitType: "emergency",
                visitNumber,
                triageStatus: validatedData.triageStatus,
                chiefComplaint: validatedData.chiefComplaint,
                status: "pending",
                arrivalTime: new Date(),
                notes: validatedData.notes || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Pasien UGD berhasil didaftarkan",
                data: {
                    patient: newPatient[0],
                    visit: newVisit[0],
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validasi gagal", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Quick ER registration error:", error);
        return NextResponse.json(
            { error: "Gagal mendaftarkan pasien UGD" },
            { status: 500 }
        );
    }
}
