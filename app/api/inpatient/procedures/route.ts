/**
 * Inpatient Procedures API Route
 * Handles procedure orders for inpatient care
 */

import z from "zod"
import { NextRequest, NextResponse } from "next/server"

import { createInpatientProcedure, getInpatientProcedures } from "@/lib/inpatient/api-service"
import { inpatientProcedureSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * GET /api/inpatient/procedures?visitId={visitId}
 * Fetch procedures for a visit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visitId = searchParams.get("visitId")

    if (!visitId) {
      return NextResponse.json({ error: "Visit ID is required" }, { status: 400 })
    }

    const procedures = await getInpatientProcedures(visitId)

    return NextResponse.json({
      success: true,
      data: procedures,
    })
  } catch (error) {
    console.error("Error fetching procedures:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch procedures" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inpatient/procedures
 * Create a new procedure order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = inpatientProcedureSchema.parse(body)

    await createInpatientProcedure(validatedData)

    const response: ResponseApi = {
      message: "Procedure order created successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error creating procedure:", error)

    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to create procedure"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
