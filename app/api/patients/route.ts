import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { patients } from "@/db/schema"
import { or, like, count, desc, eq } from "drizzle-orm"
import { z } from "zod"
import { generateMRNumber } from "@/lib/generators"
import { withRBAC } from "@/lib/rbac/middleware"

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
})

/**
 * POST /api/patients
 * Create a new patient
 * Requires: patients:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = patientSchema.parse(body)

      // Check if NIK already exists (if provided)
      if (validatedData.nik) {
        const existingPatient = await db
          .select()
          .from(patients)
          .where(eq(patients.nik, validatedData.nik))
          .limit(1)

        if (existingPatient.length > 0) {
          return NextResponse.json(
            { error: "Patient with this NIK already exists" },
            { status: 409 }
          )
        }
      }

      // Generate unique MR Number
      const mrNumber = await generateMRNumber()

      // Create patient
      const newPatient = await db
        .insert(patients)
        .values({
          mrNumber,
          nik: validatedData.nik || null,
          name: validatedData.name,
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
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
        .returning()

      return NextResponse.json(
        {
          success: true,
          message: "Patient created successfully",
          data: newPatient[0],
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

      console.error("Patient creation error:", error)
      return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
    }
  },
  { permissions: ["patients:write"] }
)

/**
 * GET /api/patients
 * Get all patients with pagination and search
 * Requires: patients:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const url = new URL(request.url)
      const search = url.searchParams.get("search")
      const page = parseInt(url.searchParams.get("page") || "1")
      const limit = parseInt(url.searchParams.get("limit") || "10")

      const offset = (page - 1) * limit

      // Build search condition
      let searchCondition
      if (search) {
        searchCondition = or(
          like(patients.name, `%${search}%`),
          like(patients.nik, `%${search}%`),
          like(patients.mrNumber, `%${search}%`)
        )
      }

      // Get total count
      const countQuery = searchCondition
        ? db.select({ count: count() }).from(patients).where(searchCondition)
        : db.select({ count: count() }).from(patients)

      const [{ count: total }] = await countQuery

      // Get paginated patients
      let patientsQuery = db
        .select()
        .from(patients)
        .orderBy(desc(patients.createdAt))
        .limit(limit)
        .offset(offset)

      if (searchCondition) {
        patientsQuery = patientsQuery.where(searchCondition) as typeof patientsQuery
      }

      const patientsList = await patientsQuery

      return NextResponse.json({
        success: true,
        patients: patientsList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Patient fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
    }
  },
  { permissions: ["patients:read"] }
)
