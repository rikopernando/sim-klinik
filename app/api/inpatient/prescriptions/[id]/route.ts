/**
 * Inpatient Prescription [id] API Route
 * DELETE /api/inpatient/prescriptions/[id]
 */

import { NextRequest, NextResponse } from "next/server"
import { deleteInpatientPrescription } from "@/lib/inpatient/api-service"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      const response: ResponseError<unknown> = {
        error: "Prescription ID is required",
        message: "Prescription ID is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    await deleteInpatientPrescription(id)

    const response: ResponseApi = {
      message: "Prescription deleted successfully",
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error deleting prescription:", error)
    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to deleting prescription"
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
