/**
 * Check Duplicate Batch API
 * Validates if a batch number already exists for a specific drug
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { checkDuplicateBatch } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { DuplicateBatchCheck } from "@/types/inventory"

// Validation schema for query parameters
const batchCheckQuerySchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
})

/**
 * GET /api/pharmacy/inventory/[drugId]/check-batch?batchNumber=XXX
 * Check if batch number exists for the drug
 *
 * Query Parameters:
 * - batchNumber: The batch number to check (required)
 *
 * Returns:
 * - exists: boolean indicating if duplicate found
 * - batch: Optional batch details if duplicate exists
 */
export async function GET(request: NextRequest, context: { params: Promise<{ drugId: string }> }) {
  try {
    const { drugId } = await context.params

    // Validate drug ID
    if (!drugId || drugId.trim() === "") {
      const response: ResponseError<unknown> = {
        error: {},
        message: "Drug ID is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    // Extract and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      batchNumber: searchParams.get("batchNumber") || "",
    }

    const validationResult = batchCheckQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      const response: ResponseError<unknown> = {
        error: validationResult.error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    const { batchNumber } = validationResult.data

    // Check for duplicate batch using service layer
    const result = await checkDuplicateBatch(drugId, batchNumber)

    const response: ResponseApi<DuplicateBatchCheck> = {
      message: result.exists ? "Batch number already exists" : "Batch number is available",
      data: result,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Check batch error:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to check batch number",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
