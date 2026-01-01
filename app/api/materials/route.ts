/**
 * Medical Materials/Supplies Usage API
 * Track materials used for inpatient care (for billing purposes)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { materialUsageSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { recordMaterialUsage } from "@/lib/inpatient/api-service"

/**
 * POST /api/materials
 * Record material usage
 * Supports both serviceId (preferred) and legacy materialName approach
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = materialUsageSchema.parse(body)

    // Check if visit exists
    const visit = await db
      .select()
      .from(visits)
      .where(eq(visits.id, validatedData.visitId))
      .limit(1)

    if (visit.length === 0) {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Associated visit not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    await recordMaterialUsage(validatedData)

    const response: ResponseApi = {
      message: "Material usage recorded successfully",
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
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to record material usage"
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
