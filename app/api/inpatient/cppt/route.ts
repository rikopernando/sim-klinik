/**
 * Inpatient CPPT API Endpoint
 * POST /api/inpatient/cppt - Create CPPT entry
 * GET /api/inpatient/cppt?visitId={id} - Get CPPT history
 */

import { NextRequest, NextResponse } from "next/server"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { cpptSchema } from "@/lib/inpatient/validation"
import { createCPPTEntry, getCPPTEntries } from "@/lib/inpatient/api-service"
import { getSession } from "@/lib/rbac"

export async function POST(request: NextRequest) {
  try {
    // Get session to retrieve user ID and role
    const session = await getSession()

    if (!session?.user) {
      const response: ResponseError<unknown> = {
        error: "Unauthorized",
        status: HTTP_STATUS_CODES.UNAUTHORIZED,
        message: "You must be logged in to create CPPT entries",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.UNAUTHORIZED })
    }

    const body = await request.json()

    // Determine author role from session
    const authorRole = session.user.role === "doctor" ? "doctor" : "nurse"

    // Validate request body and set authorId and authorRole from session
    const validatedData = cpptSchema.parse({
      ...body,
      authorId: session.user.id,
      authorRole: authorRole,
    })

    // Create CPPT entry
    await createCPPTEntry(validatedData)

    const response: ResponseApi = {
      status: HTTP_STATUS_CODES.CREATED,
      message: "CPPT entry created successfully",
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    console.error("Error creating CPPT entry:", error)

    if (error instanceof Error && error.name === "ZodError") {
      const response: ResponseError<unknown> = {
        error: "Validation failed",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "Invalid CPPT data",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    const response: ResponseError<unknown> = {
      error: error instanceof Error ? error.message : "Unknown error",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Failed to create CPPT entry",
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visitId = searchParams.get("visitId")

    if (!visitId) {
      const response: ResponseError<unknown> = {
        error: "Missing visitId parameter",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: "visitId is required",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    // Get CPPT entries
    const entries = await getCPPTEntries(visitId)

    const response: ResponseApi<typeof entries> = {
      status: HTTP_STATUS_CODES.OK,
      message: "CPPT entries fetched successfully",
      data: entries,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching CPPT entries:", error)

    const response: ResponseError<unknown> = {
      error: error instanceof Error ? error.message : "Unknown error",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Failed to fetch CPPT entries",
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
  }
}
