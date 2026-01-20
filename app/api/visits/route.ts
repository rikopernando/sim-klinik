import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits, patients, vitalsHistory } from "@/db/schema"
import { eq, and, gte, lt } from "drizzle-orm"
import { z } from "zod"
import { generateVisitNumber, generateQueueNumber } from "@/lib/generators"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { calculateBMI } from "@/lib/inpatient/vitals-utils"
import { RegisteredVisit } from "@/types/registration"

/**
 * Visit Registration Schema
 */
const visitSchema = z.object({
  patientId: z.string(),
  visitType: z.enum(["outpatient", "inpatient", "emergency"]),
  poliId: z.string().optional(),
  doctorId: z.string().optional(),
  triageStatus: z.enum(["red", "yellow", "green"]).optional(),
  chiefComplaint: z.string().optional(),
  roomId: z.string().optional(),
  notes: z.string().optional(),
  // Vital Signs (all optional)
  temperature: z.string().optional(),
  bloodPressureSystolic: z.number().int().optional(),
  bloodPressureDiastolic: z.number().int().optional(),
  pulse: z.number().int().optional(),
  respiratoryRate: z.number().int().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  painScale: z.number().int().optional(),
  consciousness: z.string().optional(),
})

/**
 * Check if any vital signs are provided
 */
function hasVitalSigns(data: z.infer<typeof visitSchema>): boolean {
  return !!(
    data.temperature ||
    data.bloodPressureSystolic ||
    data.bloodPressureDiastolic ||
    data.pulse ||
    data.respiratoryRate ||
    data.oxygenSaturation ||
    data.weight ||
    data.height ||
    data.painScale ||
    data.consciousness
  )
}

/**
 * POST /api/visits
 * Create a new visit/registration
 * Requires: visits:write permission
 */
export const POST = withRBAC(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = visitSchema.parse(body)

      // Verify patient exists
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, validatedData.patientId))
        .limit(1)

      if (patient.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Patient not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      // Generate visit number
      const visitNumber = await generateVisitNumber()

      // Generate queue number for outpatient visits
      let queueNumber = null
      if (validatedData.visitType === "outpatient" && validatedData.poliId) {
        queueNumber = await generateQueueNumber(validatedData.poliId)
      }

      // Validate required fields based on visit type
      if (validatedData.visitType === "outpatient" && !validatedData.poliId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Poli ID is required for outpatient visits",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      if (validatedData.visitType === "emergency" && !validatedData.chiefComplaint) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Chief complaint is required for emergency visits",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Get initial status based on visit type
      const initialStatus = "registered"

      const newVisit = await db.transaction(async (tx) => {
        // Create visit
        const [createdVisit] = await tx
          .insert(visits)
          .values({
            patientId: validatedData.patientId,
            visitType: validatedData.visitType,
            visitNumber,
            poliId: validatedData.poliId || null,
            doctorId: validatedData.doctorId || null,
            queueNumber,
            triageStatus: validatedData.triageStatus || null,
            chiefComplaint: validatedData.chiefComplaint || null,
            roomId: validatedData.roomId || null,
            admissionDate: validatedData.visitType === "inpatient" ? new Date() : null,
            status: initialStatus,
            notes: validatedData.notes || null,
          })
          .returning()

        // Save vital signs if any are provided
        if (hasVitalSigns(validatedData)) {
          const bmi = calculateBMI(validatedData.weight || "0", validatedData.height || "0")
          await tx.insert(vitalsHistory).values({
            visitId: createdVisit.id,
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
            recordedBy: context.user.id,
            notes: validatedData.notes || null,
          })
        }

        return createdVisit
      })
      // Fetch complete visit with patient data
      const [completeVisit] = await db
        .select({
          visit: {
            id: visits.id,
            visitNumber: visits.visitNumber,
            queueNumber: visits.queueNumber,
            visitType: visits.visitType,
            arrivalTime: visits.arrivalTime,
          },
          patient: {
            id: patients.id,
            mrNumber: patients.mrNumber,
            name: patients.name,
          },
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(visits.id, newVisit.id))
        .limit(1)

      const response: ResponseApi<RegisteredVisit> = {
        message: "Visit registered successfully",
        data: {
          visit: {
            id: completeVisit.visit.id,
            visitNumber: completeVisit.visit.visitNumber,
            queueNumber: completeVisit.visit.queueNumber || "",
            visitType: completeVisit.visit.visitType,
            arrivalTime: completeVisit.visit.arrivalTime.toISOString(),
          },
          patient: {
            id: completeVisit?.patient?.id || "",
            mrNumber: completeVisit?.patient?.mrNumber || "",
            name: completeVisit?.patient?.name || "",
          },
        },
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
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      console.error("Visit creation error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to create visit",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["visits:write"] }
)

/**
 * GET /api/visits?poliId=X&status=pending
 * Get visits queue for a specific poli
 * Requires: visits:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const poliId = searchParams.get("poliId")
      const status = searchParams.get("status")
      const visitType = searchParams.get("visitType")

      // Build query conditions
      const conditions = []

      if (poliId) {
        conditions.push(eq(visits.poliId, poliId))
      }

      if (status) {
        conditions.push(eq(visits.status, status))
      }

      if (visitType) {
        conditions.push(eq(visits.visitType, visitType))
      }

      // Get today's date range for filtering (only today's visits)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      conditions.push(gte(visits.arrivalTime, today))
      conditions.push(lt(visits.arrivalTime, tomorrow))

      // Query visits with patient data
      const visitQueue = await db
        .select({
          visit: visits,
          patient: patients,
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .where(and(...conditions))
        .orderBy(visits.arrivalTime)

      return NextResponse.json({
        success: true,
        data: visitQueue,
        count: visitQueue.length,
      })
    } catch (error) {
      console.error("Visit queue fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch visit queue" }, { status: 500 })
    }
  },
  { permissions: ["visits:read"] }
)

/**
 * PATCH /api/visits/:id
 * Update visit status or information
 * Requires: visits:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { id, ...updateData } = body

      if (!id) {
        return NextResponse.json({ error: "Visit ID is required" }, { status: 400 })
      }

      // Update visit
      const updatedVisit = await db
        .update(visits)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(visits.id, id))
        .returning()

      if (updatedVisit.length === 0) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: "Visit updated successfully",
        data: updatedVisit[0],
      })
    } catch (error) {
      console.error("Visit update error:", error)
      return NextResponse.json({ error: "Failed to update visit" }, { status: 500 })
    }
  },
  { permissions: ["visits:write"] }
)
