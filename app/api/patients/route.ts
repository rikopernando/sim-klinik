import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateMRNumber } from "@/lib/generators";

/**
 * Patient Registration Schema
 * Zod validation for creating new patients
 */
const patientSchema = z.object({
    nik: z.string().length(16, "NIK must be exactly 16 digits").optional(),
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    dateOfBirth: z.string().optional(), // ISO date string
    gender: z.enum(["male", "female", "other"]).optional(),
    address: z.string().optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional().or(z.literal("")),
    insuranceType: z.string().max(50).optional(),
    insuranceNumber: z.string().max(50).optional(),
    emergencyContact: z.string().max(255).optional(),
    emergencyPhone: z.string().max(20).optional(),
    bloodType: z.string().max(5).optional(),
    allergies: z.string().optional(),
});

/**
 * POST /api/patients
 * Create a new patient
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = patientSchema.parse(body);

        // Check if NIK already exists (if provided)
        if (validatedData.nik) {
            const existingPatient = await db
                .select()
                .from(patients)
                .where(eq(patients.nik, validatedData.nik))
                .limit(1);

            if (existingPatient.length > 0) {
                return NextResponse.json(
                    { error: "Patient with this NIK already exists" },
                    { status: 409 }
                );
            }
        }

        // Generate unique MR Number
        const mrNumber = await generateMRNumber();

        // Create patient
        const newPatient = await db
            .insert(patients)
            .values({
                mrNumber,
                nik: validatedData.nik || null,
                name: validatedData.name,
                dateOfBirth: validatedData.dateOfBirth
                    ? new Date(validatedData.dateOfBirth)
                    : null,
                gender: validatedData.gender || null,
                address: validatedData.address || null,
                phone: validatedData.phone || null,
                email: validatedData.email || null,
                insuranceType: validatedData.insuranceType || null,
                insuranceNumber: validatedData.insuranceNumber || null,
                emergencyContact: validatedData.emergencyContact || null,
                emergencyPhone: validatedData.emergencyPhone || null,
                bloodType: validatedData.bloodType || null,
                allergies: validatedData.allergies || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Patient created successfully",
                data: newPatient[0],
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Patient creation error:", error);
        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/patients/:id
 * Get patient by ID
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Patient ID is required" },
                { status: 400 }
            );
        }

        const patient = await db
            .select()
            .from(patients)
            .where(eq(patients.id, parseInt(id, 10)))
            .limit(1);

        if (patient.length === 0) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: patient[0],
        });
    } catch (error) {
        console.error("Patient fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch patient" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/patients/:id
 * Update patient information
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Patient ID is required" },
                { status: 400 }
            );
        }

        // Validate update data
        const validatedData = patientSchema.partial().parse(updateData);

        // Prepare update object with proper type conversions
        const updateObject: Record<string, unknown> = {
            ...validatedData,
            updatedAt: new Date(),
        };

        // Convert dateOfBirth string to Date if present
        if (validatedData.dateOfBirth) {
            updateObject.dateOfBirth = new Date(validatedData.dateOfBirth);
        }

        // Update patient
        const updatedPatient = await db
            .update(patients)
            .set(updateObject)
            .where(eq(patients.id, id))
            .returning();

        if (updatedPatient.length === 0) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Patient updated successfully",
            data: updatedPatient[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Patient update error:", error);
        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}
