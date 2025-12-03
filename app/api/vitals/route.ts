/**
 * Vital Signs API
 * Record and retrieve patient vital signs
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { vitalsHistory } from "@/db/schema/inpatient"
import { visits } from "@/db/schema/visits"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"

/**
 * Vital Signs Schema
 */
const vitalSignsSchema = z.object({
  visitId: z.number().int().positive("Visit ID harus valid"),
  temperature: z.string().optional(),
  bloodPressureSystolic: z.number().int().optional(),
  bloodPressureDiastolic: z.number().int().optional(),
  pulse: z.number().int().optional(),
  respiratoryRate: z.number().int().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  painScale: z.number().int().min(0).max(10).optional(),
  consciousness: z.string().optional(),
  notes: z.string().optional(),
  recordedBy: z.string().min(1, "Recorded by is required"),
})

/**
 * POST /api/vitals
 * Record new vital signs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = vitalSignsSchema.parse(body)

    // Check if visit exists
    const visit = await db
      .select()
      .from(visits)
      .where(eq(visits.id, validatedData.visitId))
      .limit(1)

    if (visit.length === 0) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 })
    }

    // Calculate BMI if height and weight provided
    let bmi = null
    if (validatedData.height && validatedData.weight) {
      const heightInMeters = parseFloat(validatedData.height) / 100
      const weightInKg = parseFloat(validatedData.weight)
      bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2)
    }

    // Create vital signs record
    const newVitals = await db
      .insert(vitalsHistory)
      .values({
        visitId: validatedData.visitId,
        temperature: validatedData.temperature || null,
        bloodPressureSystolic: validatedData.bloodPressureSystolic || null,
        bloodPressureDiastolic: validatedData.bloodPressureDiastolic || null,
        pulse: validatedData.pulse || null,
        respiratoryRate: validatedData.respiratoryRate || null,
        oxygenSaturation: validatedData.oxygenSaturation || null,
        weight: validatedData.weight || null,
        height: validatedData.height || null,
        bmi: bmi || null,
        painScale: validatedData.painScale || null,
        consciousness: validatedData.consciousness || null,
        recordedBy: validatedData.recordedBy,
        recordedAt: new Date(),
        notes: validatedData.notes || null,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: "Vital signs recorded successfully",
        data: newVitals[0],
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Vital signs creation error:", error)
    return NextResponse.json({ error: "Failed to record vital signs" }, { status: 500 })
  }
}

/**
 * GET /api/vitals?visitId=X
 * Get vital signs history for a visit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const visitId = searchParams.get("visitId")

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID is required" }, { status: 400 })
    }

    // Get vital signs history
    const vitals = await db
      .select()
      .from(vitalsHistory)
      .where(eq(vitalsHistory.visitId, parseInt(visitId, 10)))
      .orderBy(desc(vitalsHistory.recordedAt))

    return NextResponse.json({
      success: true,
      data: vitals,
      count: vitals.length,
    })
  } catch (error) {
    console.error("Vital signs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch vital signs" }, { status: 500 })
  }
}
