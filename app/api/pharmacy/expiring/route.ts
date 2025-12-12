/**
 * Expiry Notification API
 * Get drugs that are expiring soon (< 30 days)
 */

import { NextResponse } from "next/server"
import { getExpiringDrugs } from "@/lib/pharmacy/api-service"
import { ResponseApi, ResponseError } from "@/types/api"
import { ExpiringDrugsData } from "@/types/pharmacy"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { withRBAC } from "@/lib/rbac"

/**
 * GET /api/pharmacy/expiring
 * Get all drugs with expiry date < 30 days
 * Returns drugs sorted by expiry date (earliest first)
 * Grouped by alert level for better UX
 */
export const GET = withRBAC(
  async () => {
    try {
      const expiringDrugs = await getExpiringDrugs()

      // Group by alert level for better UX
      const expired = expiringDrugs.filter((d) => d.expiryAlertLevel === "expired")
      const expiringSoon = expiringDrugs.filter((d) => d.expiryAlertLevel === "expiring_soon")
      const warning = expiringDrugs.filter((d) => d.expiryAlertLevel === "warning")

      const response: ResponseApi<ExpiringDrugsData> = {
        message: "Expiring drugs fetched successfully",
        data: {
          all: expiringDrugs,
          expired,
          expiringSoon,
          warning,
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Expiring drugs fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch expiring drugs",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  {
    permissions: ["pharmacy:read"],
  }
)
