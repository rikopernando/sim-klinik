import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { patients } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * Patient Update Schema
 * Zod validation for updating patients
 */
const patientUpdateSchema = z.object({
  nik: z.string().length(16, "NIK must be exactly 16 digits").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(255).optional(),
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
})

/**
 * GET /api/patients/[id]
 * Get a single patient by ID
 * Requires: patients:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const patientId = parseInt(params.id, 10)

      if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
      }

      const patient = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1)

      if (patient.length === 0) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: patient[0],
      })
    } catch (error) {
      console.error("Patient fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
    }
  },
  { permissions: ["patients:read"] }
)

/**
 * PATCH /api/patients/[id]
 * Update patient information
 * Requires: patients:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const patientId = parseInt(params.id, 10)

      if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
      }

      const body = await request.json()

      // Validate update data
      const validatedData = patientUpdateSchema.parse(body)

      // Prepare update object with proper type conversions
      const updateObject: Record<string, unknown> = {
        ...validatedData,
        updatedAt: new Date(),
      }

      // Convert dateOfBirth string to Date if present
      if (validatedData.dateOfBirth) {
        updateObject.dateOfBirth = new Date(validatedData.dateOfBirth)
      }

      // Update patient
      const updatedPatient = await db
        .update(patients)
        .set(updateObject)
        .where(eq(patients.id, patientId))
        .returning()

      if (updatedPatient.length === 0) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: "Patient updated successfully",
        data: updatedPatient[0],
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.issues },
          { status: 400 }
        )
      }

      console.error("Patient update error:", error)
      return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
    }
  },
  { permissions: ["patients:write"] }
)

/**
 * DELETE /api/patients/[id]
 * Delete a patient (soft delete by marking as inactive)
 * Requires: patients:delete permission
 */
export const DELETE = withRBAC(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const patientId = parseInt(params.id, 10)

      if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
      }

      // Check if patient exists
      const existingPatient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1)

      if (existingPatient.length === 0) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }

      // For now, we'll do a hard delete
      // In production, you might want to soft delete instead
      await db.delete(patients).where(eq(patients.id, patientId))

      return NextResponse.json({
        success: true,
        message: "Patient deleted successfully",
      })
    } catch (error) {
      console.error("Patient delete error:", error)
      return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
    }
  },
  { permissions: ["patients:delete"] }
)
