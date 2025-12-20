/**
 * Billing Details Panel Component
 * Main panel displaying billing summary, payment history, and payment action
 */

import { useMemo, useRef } from "react"
import { User, RefreshCw, CreditCard, Percent, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import type { BillingDetails } from "@/types/billing"

import { BillingSummaryCard } from "./billing-summary-card"
import { PaymentHistoryCard } from "./payment-history-card"
import { ReceiptPrint } from "./receipt-print"

interface BillingDetailsPanelProps {
  selectedVisitId: string | null
  billingDetails: BillingDetails | null
  isLoading: boolean
  onRefresh: () => void
  onProcessPayment: () => void
  onApplyDiscount?: () => void
  isSubmitting?: boolean
}

export function BillingDetailsPanel({
  selectedVisitId,
  billingDetails,
  isLoading,
  onRefresh,
  onProcessPayment,
  onApplyDiscount,
  isSubmitting = false,
}: BillingDetailsPanelProps) {
  const printRef = useRef<HTMLDivElement>(null)

  // Calculate remaining amount
  const remainingAmount = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(
      billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable
    )
  }, [billingDetails])

  // Handle print receipt
  const handlePrint = () => {
    window.print()
  }

  // No visit selected
  if (!selectedVisitId) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg">Pilih pasien dari antrian</p>
          <p className="text-sm">untuk melihat detail pembayaran</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Memuat detail pembayaran...</p>
        </div>
      </div>
    )
  }

  // Error state (no billing details found)
  if (!billingDetails) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Gagal memuat detail pembayaran</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // Success state with billing details
  const isPaid = billingDetails.billing.paymentStatus === "paid"

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Billing Summary */}
          <BillingSummaryCard items={billingDetails.items} summary={billingDetails.billing} />

          {/* Payment History */}
          <PaymentHistoryCard payments={billingDetails.payments} />

          {/* Action Buttons */}
          {!isPaid ? (
            <>
              {/* Discount Button */}
              {onApplyDiscount && (
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={onApplyDiscount}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Percent className="mr-2 h-5 w-5" />
                      Terapkan Diskon / Jaminan
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Button */}
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <Button
                    onClick={onProcessPayment}
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
                    <span className="ml-2 font-bold">
                      Rp {remainingAmount.toLocaleString("id-ID")}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Print Receipt Button */
            <Card className="border-green-500 bg-green-50">
              <CardContent className="pt-6">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-100"
                  size="lg"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Cetak Kuitansi
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Hidden Receipt for Printing */}
      {isPaid && (
        <div ref={printRef}>
          <ReceiptPrint data={billingDetails} />
        </div>
      )}
    </>
  )
}
