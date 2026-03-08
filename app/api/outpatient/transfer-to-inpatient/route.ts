/**
 * Transfer to Inpatient API
 * POST /api/outpatient/transfer-to-inpatient
 * Transfers outpatient patients to inpatient care with bed assignment
 * Requires: visits:write permission
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { transferToInpatientSchema } from "@/lib/outpatient/validation"
import { performTransferToInpatient } from "@/lib/outpatient/api-service"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      // Parse request body
      const body = await request.json()

      // Validate input
      const validatedData = transferToInpatientSchema.parse(body)

      // Perform transfer
      const updatedVisit = await performTransferToInpatient(validatedData, user.id)

      // Return success response
      const response: ResponseApi<unknown> = {
        message: "Pasien berhasil ditransfer ke Rawat Inap",
        data: updatedVisit,
        status: HTTP_STATUS_CODES.OK,
      }

      console.log(
        `[Transfer] Visit ${validatedData.visitId} transferred to inpatient by ${user.id}`
      )

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validasi gagal",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Handle application errors
      if (error instanceof Error) {
        console.error("Transfer to inpatient error:", error)
        const response: ResponseError<unknown> = {
          error: error.message,
          message: error.message,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Handle unknown errors
      console.error("Unknown error in transfer:", error)
      const response: ResponseError<unknown> = {
        error: "Gagal melakukan transfer ke rawat inap",
        message: "Gagal melakukan transfer ke rawat inap",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["visits:write"] }
)
