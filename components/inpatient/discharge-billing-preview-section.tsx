/**
 * Discharge Billing Preview Section
 * Displays discharge billing breakdown with optional adjustment
 */

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { DischargeBillingSummary } from "@/types/billing"

interface DischargeBillingPreviewSectionProps {
  summary: DischargeBillingSummary | null
  isLoading: boolean
  adjustmentType: "none" | "discount" | "surcharge"
  adjustmentAmount: string
}

export function DischargeBillingPreviewSection({
  summary,
  isLoading,
  adjustmentType,
  adjustmentAmount,
}: DischargeBillingPreviewSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-muted/50 space-y-2 rounded-lg p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const calculateFinalTotal = () => {
    const adjustment =
      adjustmentType !== "none" && adjustmentAmount
        ? (adjustmentType === "discount" ? -1 : 1) * parseFloat(adjustmentAmount)
        : 0
    return parseFloat(summary.subtotal) + adjustment
  }

  const hasAdjustment =
    adjustmentType !== "none" && adjustmentAmount && parseFloat(adjustmentAmount) > 0

  return (
    <div className="bg-muted/50 space-y-2 rounded-lg p-4">
      <h4 className="mb-3 text-sm font-semibold">Rincian Biaya</h4>
      <div className="space-y-1.5 text-sm">
        {/* Room Charges */}
        {parseFloat(summary?.breakdown?.roomCharges?.amount || "0") > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{summary?.breakdown?.roomCharges?.label}</span>
            <span>
              {formatCurrency(parseFloat(summary?.breakdown?.roomCharges?.amount || "0"))}
            </span>
          </div>
        )}

        {/* Material Charges */}
        {parseFloat(summary?.breakdown?.materialCharges?.amount || "0") > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {summary?.breakdown?.materialCharges?.label}
            </span>
            <span>
              {formatCurrency(parseFloat(summary?.breakdown?.materialCharges?.amount || "0"))}
            </span>
          </div>
        )}

        {/* Medication Charges */}
        {parseFloat(summary.breakdown.medicationCharges.amount) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {summary.breakdown.medicationCharges.label}
            </span>
            <span>{formatCurrency(parseFloat(summary.breakdown.medicationCharges.amount))}</span>
          </div>
        )}

        {/* Procedure Charges */}
        {parseFloat(summary.breakdown.procedureCharges.amount) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {summary.breakdown.procedureCharges.label}
            </span>
            <span>{formatCurrency(parseFloat(summary.breakdown.procedureCharges.amount))}</span>
          </div>
        )}

        {/* Service Charges */}
        {parseFloat(summary.breakdown.serviceCharges.amount) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{summary.breakdown.serviceCharges.label}</span>
            <span>{formatCurrency(parseFloat(summary.breakdown.serviceCharges.amount))}</span>
          </div>
        )}

        {/* Service Charges */}
        {parseFloat(summary.breakdown.laboratoryCharges.amount) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {summary.breakdown.laboratoryCharges.label}
            </span>
            <span>{formatCurrency(parseFloat(summary.breakdown.laboratoryCharges.amount))}</span>
          </div>
        )}

        <Separator className="my-2" />

        {/* Subtotal */}
        <div className="flex justify-between font-semibold">
          <span>Subtotal Awal</span>
          <span>{formatCurrency(parseFloat(summary.subtotal))}</span>
        </div>

        {/* Adjustment if exists */}
        {hasAdjustment && (
          <>
            <div
              className={cn(
                "flex justify-between text-sm",
                adjustmentType === "discount" ? "text-destructive" : "text-primary"
              )}
            >
              <span>
                {adjustmentType === "discount" ? "Diskon Rawat Inap" : "Biaya Tambahan Rawat Inap"}
              </span>
              <span>
                {adjustmentType === "discount" ? "- " : "+ "}
                {formatCurrency(parseFloat(adjustmentAmount))}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="text-primary flex justify-between text-base font-bold">
              <span>Total Akhir</span>
              <span>{formatCurrency(calculateFinalTotal())}</span>
            </div>
          </>
        )}

        {/* Show total items */}
        <div className="text-muted-foreground pt-2 text-xs">{summary.totalItems} item total</div>
      </div>
    </div>
  )
}
