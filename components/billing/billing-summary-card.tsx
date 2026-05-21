import { formatCurrency } from "@/lib/billing/billing-utils"

interface BillingItem {
  itemName: string
  quantity: number
  unitPrice: string
  totalPrice: string
}

interface BillingSummary {
  subtotal: string
  discount: string
  insuranceCoverage: string
  totalAmount: string
  paidAmount: string
  remainingAmount: string
}

interface BillingSummaryCardProps {
  items: BillingItem[]
  summary: BillingSummary
}

export function BillingSummaryCard({ items, summary }: BillingSummaryCardProps) {
  const hasDiscount = parseFloat(summary.discount) > 0
  const hasInsurance = parseFloat(summary.insuranceCoverage) > 0
  const hasPaidAmount = parseFloat(summary.paidAmount) > 0

  return (
    <div className="px-5 py-4">
      <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
        Rincian Tagihan
      </p>

      {/* Items */}
      <div className="divide-border/50 divide-y">
        {items.map((item, index) => (
          <div key={index} className="flex items-start justify-between py-2.5">
            <div className="flex-1">
              <p className="text-sm font-medium">{item.itemName}</p>
              <p className="text-muted-foreground text-xs">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-3 space-y-1.5 border-t pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatCurrency(summary.subtotal)}</span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Diskon</span>
            <span className="text-red-600 tabular-nums">− {formatCurrency(summary.discount)}</span>
          </div>
        )}

        {hasInsurance && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ditanggung Asuransi</span>
            <span className="text-blue-600 tabular-nums">
              − {formatCurrency(summary.insuranceCoverage)}
            </span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(summary.totalAmount)}</span>
        </div>

        {hasPaidAmount && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terbayar</span>
              <span className="text-emerald-600 tabular-nums">
                {formatCurrency(summary.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2d6a4f] dark:text-[#74c69d]">
              <span>Sisa Tagihan</span>
              <span className="tabular-nums">{formatCurrency(summary.remainingAmount)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
