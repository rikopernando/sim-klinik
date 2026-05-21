/**
 * Billing Queue API
 * GET /api/billing/queue
 * Returns visits ready for billing (RME locked, not fully paid)
 */

import { NextResponse } from "next/server"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac"
import { shortCache } from "@/lib/cache/api-cache"
import { getVisitsReadyForBilling } from "@/lib/billing/api-service"

const CACHE_KEY = "billing:queue"

export const GET = withRBAC(
  async () => {
    try {
      const cached = shortCache.get(CACHE_KEY)
      const queue = cached ?? (await getVisitsReadyForBilling())

      if (!cached) {
        shortCache.set(CACHE_KEY, queue)
      }

      const response: ResponseApi<typeof queue> = {
        data: queue,
        message: "Billing queue fetched successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Billing queue error:", error)
      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch billing queue",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["billing:read"] }
)
