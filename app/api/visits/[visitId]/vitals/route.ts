import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { vitalsHistory, visits } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { calculateBMI } from "@/lib/inpatient/vitals-utils"

/**
 * Vitals Schema for validation
 */
const vitalsSchema = z.object({
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
})

/**
 * GET /api/visits/[visitId]/vitals
 * Get latest vitals for a visit
 * Requires: visits:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, { params }: { params: { visitId: string } }) => {
    try {
      const { visitId } = params

      // Check if visit exists
      const [visit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Get latest vitals for this visit
      const [latestVitals] = await db
        .select()
        .from(vitalsHistory)
        .where(eq(vitalsHistory.visitId, visitId))
        .orderBy(desc(vitalsHistory.recordedAt))
        .limit(1)

      const response: ResponseApi<typeof latestVitals | null> = {
        message: latestVitals ? "Vitals fetched successfully" : "No vitals recorded",
        data: latestVitals || null,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Vitals fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch vitals",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["visits:read"] }
)

/**
 * POST /api/visits/[visitId]/vitals
 * Add new vitals record for a visit
 * Requires: visits:write permission
 */
export const POST = withRBAC(
  async (
    request: NextRequest,
    {
      params,
      user,
    }: { params: { visitId: string }; user: { id: string; email: string; name: string } }
  ) => {
    try {
      const { visitId } = params
      const body = await request.json()

      // Validate input
      const validatedData = vitalsSchema.parse(body)

      // Check if visit exists
      const [visit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Calculate BMI if weight and height provided
      const bmi = calculateBMI(validatedData.weight || "0", validatedData.height || "0")

      // Insert new vitals record
      const [newVitals] = await db
        .insert(vitalsHistory)
        .values({
          visitId,
          temperature: validatedData.temperature || null,
          bloodPressureSystolic: validatedData.bloodPressureSystolic || null,
          bloodPressureDiastolic: validatedData.bloodPressureDiastolic || null,
          pulse: validatedData.pulse || null,
          respiratoryRate: validatedData.respiratoryRate || null,
          oxygenSaturation: validatedData.oxygenSaturation || null,
          weight: validatedData.weight || null,
          height: validatedData.height || null,
          bmi,
          painScale: validatedData.painScale || null,
          consciousness: validatedData.consciousness || null,
          recordedBy: user.id,
          notes: validatedData.notes || null,
        })
        .returning()

      const response: ResponseApi<typeof newVitals> = {
        message: "Vitals recorded successfully",
        data: newVitals,
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      console.error("Vitals creation error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to record vitals",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["visits:write"] }
)
