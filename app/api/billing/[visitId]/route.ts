/**
 * Billing Details API
 * GET /api/billing/[visitId]
 * Returns billing details for a specific visit
 */

import { NextRequest, NextResponse } from "next/server"

import { getBillingDetails } from "@/lib/billing/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac"

export const GET = withRBAC(
  async (_request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Invalid visit ID",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      const billingDetails = await getBillingDetails(visitId)

      const response: ResponseApi<typeof billingDetails> = {
        data: billingDetails,
        message: "Billing details fetched successfully",
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Billing details error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch billing details",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  {
    permissions: ["billing:read"],
  }
)
