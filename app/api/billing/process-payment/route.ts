/**
 * Merged Payment Processing API
 * Handles discount application and payment in a single transaction
 */

import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { processPaymentSchema } from "@/lib/billing/validation"
import { processPaymentWithDiscount } from "@/lib/billing/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { withRBAC } from "@/lib/rbac"

/**
 * POST /api/billing/process-payment
 * Process payment with optional discount and insurance in a single transaction
 *
 * Request Body:
 * {
 *   billingId: string
 *   discount?: string (nominal discount amount)
 *   discountPercentage?: string (percentage discount, e.g., "10")
 *   insuranceCoverage?: string (insurance coverage amount)
 *   amount: string (payment amount)
 *   paymentMethod: "cash" | "transfer" | "card" | "insurance"
 *   amountReceived?: string (for cash payments, to calculate change)
 *   paymentReference?: string (reference number for non-cash payments)
 *   receivedBy: string (user ID of cashier/staff)
 *   notes?: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 * }
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()

      // Validate input using Zod schema with custom refinements
      const validatedData = processPaymentSchema.parse(body)

      // Process payment with discount (atomic transaction)
      await processPaymentWithDiscount(validatedData)

      const response: ResponseApi = {
        message: "Payment processed successfully",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      console.error("Process payment error:", error)

      // Handle business logic errors
      const errorMessage = error instanceof Error ? error.message : "Gagal memproses pembayaran"
      const response: ResponseError<unknown> = {
        error: errorMessage,
        message: errorMessage,
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["billing:write"] }
)
