/**
 * Billing Preview Section Component
 * Displays billing breakdown with optional adjustment
 */

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { BillingPreview, formatCurrency } from "@/lib/utils/billing"

interface BillingPreviewSectionProps {
  billingPreview: BillingPreview
  adjustmentType: "none" | "discount" | "surcharge"
  adjustmentAmount: string
}

export function BillingPreviewSection({
  billingPreview,
  adjustmentType,
  adjustmentAmount,
}: BillingPreviewSectionProps) {
  const calculateFinalTotal = () => {
    const adjustment =
      adjustmentType !== "none" && adjustmentAmount
        ? (adjustmentType === "discount" ? -1 : 1) * parseFloat(adjustmentAmount)
        : 0
    return billingPreview.subtotal + adjustment
  }

  const hasAdjustment =
    adjustmentType !== "none" && adjustmentAmount && parseFloat(adjustmentAmount) > 0

  return (
    <div className="bg-muted/50 space-y-2 rounded-lg p-4">
      <h4 className="mb-3 text-sm font-semibold">Ringkasan Billing</h4>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal Obat</span>
          <span>{formatCurrency(billingPreview.drugsSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal Tindakan</span>
          <span>{formatCurrency(billingPreview.proceduresSubtotal)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold">
          <span>Subtotal Awal</span>
          <span>{formatCurrency(billingPreview.subtotal)}</span>
        </div>

        {hasAdjustment && (
          <>
            <div
              className={cn(
                "flex justify-between text-sm",
                adjustmentType === "discount" ? "text-destructive" : "text-primary"
              )}
            >
              <span>{adjustmentType === "discount" ? "Diskon Dokter" : "Biaya Tambahan"}</span>
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
      </div>
    </div>
  )
}
