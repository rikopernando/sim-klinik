/**
 * Quick ER Registration API
 * Handles rapid patient registration for emergency cases
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { quickERRegistrationSchema } from "@/lib/emergency/validation"
import { createQuickERRegistration } from "@/lib/emergency/api-service"
import { APIResponse } from "@/types/emergency"
import { withRBAC } from "@/lib/rbac/middleware"
import { sendNotification } from "@/lib/notifications/sse-manager"

/**
 * POST /api/emergency/quick-register
 * Quick emergency registration - creates both patient and visit in one go
 * Used for urgent cases where we need minimal data to start treatment
 */
export const POST = withRBAC(
  async (req) => {
    try {
      // Parse request body
      const body = await req.json()

      // Validate input
      const validatedData = quickERRegistrationSchema.parse(body)

      // Create registration
      const result = await createQuickERRegistration(validatedData)

      // Broadcast SSE notification for new ER patient
      sendNotification("emergency", "er_new_patient", {
        visitId: result.visit.id,
        patientName: result.patient.name,
        patientMRNumber: result.patient.mrNumber,
        triageStatus: validatedData.triageStatus,
        chiefComplaint: validatedData.chiefComplaint,
        arrivalTime: new Date(),
      })

      // Return success response
      const response: APIResponse = {
        success: true,
        message: "Pasien UGD berhasil didaftarkan",
        data: result,
      }

      return NextResponse.json(response, { status: 201 })
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const response: APIResponse = {
          success: false,
          error: "Validasi gagal",
          details: error.issues,
        }
        return NextResponse.json(response, { status: 400 })
      }

      // Handle application errors
      if (error instanceof Error) {
        console.error("Quick ER registration error:", error)
        const response: APIResponse = {
          success: false,
          error: error.message,
        }
        return NextResponse.json(response, { status: 400 })
      }

      // Handle unknown errors
      console.error("Unknown error in quick ER registration:", error)
      const response: APIResponse = {
        success: false,
        error: "Gagal mendaftarkan pasien UGD",
      }
      return NextResponse.json(response, { status: 500 })
    }
  },
  { roles: ["receptionist", "nurse", "doctor", "admin", "super_admin"] }
)
