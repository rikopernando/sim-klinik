import { NextRequest, NextResponse } from "next/server"
import { bulkFulfillPrescriptions } from "@/lib/pharmacy/api-service"
import { getErrorMessage } from "@/lib/utils/error"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * POST /api/pharmacy/fulfillment/bulk
 * Bulk fulfill multiple prescriptions atomically
 */
export const POST = withRBAC(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { prescriptions } = body

      if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
        return NextResponse.json(
          { error: "Prescriptions array is required and must not be empty" },
          { status: 400 }
        )
      }

      // Validate each prescription item
      for (const item of prescriptions) {
        if (
          !item.prescriptionId ||
          !item.inventoryId ||
          !item.dispensedQuantity ||
          !item.fulfilledBy
        ) {
          return NextResponse.json(
            {
              error:
                "Each prescription must have prescriptionId, inventoryId, dispensedQuantity, and fulfilledBy",
            },
            { status: 400 }
          )
        }
      }

      const results = await bulkFulfillPrescriptions(prescriptions)

      return NextResponse.json({
        success: true,
        message: `Successfully fulfilled ${results.length} prescriptions`,
        data: results,
      })
    } catch (error) {
      console.error("Bulk fulfillment error:", error)
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }
  },
  { permissions: ["prescriptions:fulfill"] }
)
