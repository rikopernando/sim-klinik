"use client"

import { useRef } from "react"
import { CreditCard, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency, getPaymentMethodLabel } from "@/lib/billing/billing-utils"
import type { BillingDetails } from "@/types/billing"

import { ReceiptPrint } from "./receipt-print"

interface BillingDetailsPanelProps {
  billingDetails: BillingDetails | null
  isLoading: boolean
  onProcessPaymentWithDiscount: () => void
  isSubmitting?: boolean
}

export function BillingDetailsPanel({
  billingDetails,
  isLoading,
  onProcessPaymentWithDiscount,
  isSubmitting = false,
}: BillingDetailsPanelProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const billing = billingDetails?.billing
  const payments = billingDetails?.payments ?? []
  const isPaid = billing?.paymentStatus === "paid"
  const hasDiscount = billing ? parseFloat(billing.discount) > 0 : false
  const hasInsurance = billing ? parseFloat(billing.insuranceCoverage) > 0 : false
  const hasPaidAmount = billing ? parseFloat(billing.paidAmount) > 0 : false
  const isReady = !isLoading && !!billingDetails

  return (
    <>
      <div className="bg-background shrink-0 border-t">
        {/* Payment history strip — compact chips */}
        {isReady && payments.length > 0 && (
          <div className="border-b px-5 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-widest uppercase">
                Riwayat:
              </span>
              {payments.map((payment) => {
                const hasChange = payment.changeGiven && parseFloat(payment.changeGiven) > 0
                return (
                  <div
                    key={payment.id}
                    className="bg-muted/50 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                  >
                    <span className="font-mono font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground capitalize">
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </span>
                    {hasChange && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          Kembalian {formatCurrency(payment.changeGiven!)}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Main summary bar */}
        <div className="flex items-center justify-between gap-6 px-5 py-3">
          {/* Totals — horizontal */}
          <div className="flex items-center gap-5">
            <div>
              <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                Subtotal
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums">
                {isReady ? formatCurrency(billing!.subtotal) : "—"}
              </p>
            </div>

            {hasDiscount && (
              <>
                <div className="text-muted-foreground/30 select-none">|</div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    Diskon
                  </p>
                  <p className="font-mono text-sm font-semibold text-red-500 tabular-nums">
                    − {formatCurrency(billing!.discount)}
                  </p>
                </div>
              </>
            )}

            {hasInsurance && (
              <>
                <div className="text-muted-foreground/30 select-none">|</div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    Asuransi
                  </p>
                  <p className="font-mono text-sm font-semibold text-blue-500 tabular-nums">
                    − {formatCurrency(billing!.insuranceCoverage)}
                  </p>
                </div>
              </>
            )}

            <div className="border-l pl-5">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                Total
              </p>
              <p
                className={cn(
                  "font-mono text-base font-bold tabular-nums",
                  !isReady && "text-muted-foreground"
                )}
              >
                {isReady ? formatCurrency(billing!.totalAmount) : "—"}
              </p>
            </div>

            {hasPaidAmount && (
              <>
                <div className="text-muted-foreground/30 select-none">|</div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    Terbayar
                  </p>
                  <p className="font-mono text-sm font-semibold text-emerald-600 tabular-nums">
                    {formatCurrency(billing!.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-primary text-[11px] font-semibold tracking-widest uppercase">
                    Sisa
                  </p>
                  <p className="text-primary font-mono text-sm font-bold tabular-nums">
                    {formatCurrency(billing!.remainingAmount)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="shrink-0">
            {isPaid ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-900/20">
                  <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Lunas
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer size={13} />
                  Cetak Kuitansi
                </Button>
              </div>
            ) : (
              <Button
                onClick={onProcessPaymentWithDiscount}
                disabled={isSubmitting || !isReady}
                className="gap-2 px-6"
              >
                <CreditCard size={14} />
                {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isPaid && billingDetails && (
        <div ref={printRef} className="hidden print:block">
          <ReceiptPrint data={billingDetails} />
        </div>
      )}
    </>
  )
}
