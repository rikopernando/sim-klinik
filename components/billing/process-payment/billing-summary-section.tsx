/**
 * Billing Summary Section Component
 * Displays billing breakdown with discount, insurance, and final total
 */

import { formatCurrency } from "@/lib/billing/billing-utils"
import type { DiscountType } from "@/hooks/use-discount-calculation"

interface BillingSummarySectionProps {
  subtotal: number
  discountType: DiscountType
  discountAmount: number
  insurance: number
  finalTotal: number
  isValidTotal: boolean
}

export function BillingSummarySection({
  subtotal,
  discountType,
  discountAmount,
  insurance,
  finalTotal,
  isValidTotal,
}: BillingSummarySectionProps) {
  return (
    <div className="bg-muted/50 rounded-lg border p-4">
      <div className="space-y-2 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {/* Discount (if applied) */}
        {discountType !== "none" && (
          <div className="flex justify-between text-red-600">
            <span>
              Diskon
              {discountType === "drugs_only" && " (Obat)"}
              {discountType === "procedures_only" && " (Tindakan)"}
            </span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        {/* Insurance (if applied) */}
        {insurance > 0 && (
          <div className="flex justify-between text-blue-600">
            <span>Ditanggung Asuransi</span>
            <span>- {formatCurrency(insurance)}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between border-t pt-2 text-lg font-bold">
          <span>Total Dibayar Pasien</span>
          <span className={finalTotal < 0 ? "text-red-600" : ""}>{formatCurrency(finalTotal)}</span>
        </div>

        {/* Validation Error */}
        {!isValidTotal && (
          <p className="text-xs text-red-600">Total tidak valid, periksa kembali input</p>
        )}
      </div>
    </div>
  )
}
