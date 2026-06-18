"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"

import { useBillingQueue } from "@/hooks/use-billing-queue"
import { useBillingDetails } from "@/hooks/use-billing-details"
import { useBillingCalculations } from "@/hooks/use-billing-calculations"
import { useProcessPayment } from "@/hooks/use-process-payment"
import { useSession } from "@/lib/auth-client"
import { getVisitTypeConfig } from "@/lib/billing/billing-utils"
import { ProcessPaymentDialog } from "@/components/billing/process-payment-dialog"
import { QueueSidebar } from "@/components/billing/queue-sidebar"
import { BillingItemsPanel } from "@/components/billing/billing-items-panel"
import { BillingDetailsPanel } from "@/components/billing/billing-details-panel"
import { PatientHeader } from "@/components/billing/patient-header"
import type { ProcessPaymentData } from "@/types/billing"
import { PageGuard } from "@/components/auth/page-guard"

export default function CashierDashboard() {
  return (
    <PageGuard roles={["cashier", "super_admin", "admin"]}>
      <CashierContent />
    </PageGuard>
  )
}

function CashierContent() {
  const { data: session } = useSession()
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [processPaymentDialogOpen, setProcessPaymentDialogOpen] = useState(false)

  const {
    queue,
    isLoading: queueLoading,
    lastRefresh,
    refresh: refreshQueue,
  } = useBillingQueue({
    autoRefresh: true,
    refreshInterval: 30000,
  })

  const { billingDetails, fetchBillingDetails, isLoading: detailsLoading } = useBillingDetails()

  const { subtotal, totalAmount, paidAmount, remainingAmount, drugsSubtotal, proceduresSubtotal } =
    useBillingCalculations(billingDetails)

  const { isProcessing, processPayment } = useProcessPayment({
    onSuccess: () => {
      setProcessPaymentDialogOpen(false)
      refreshQueue()
      if (selectedVisitId) {
        fetchBillingDetails(selectedVisitId)
      }
    },
  })

  const handleSelectVisit = useCallback(
    (visitId: string) => {
      setSelectedVisitId(visitId)
      fetchBillingDetails(visitId)
    },
    [fetchBillingDetails]
  )

  // Auto-select first queue item when queue loads and nothing is selected
  useEffect(() => {
    if (queue.length > 0 && selectedVisitId === null) {
      handleSelectVisit(queue[0].visit.id)
    }
  }, [queue, selectedVisitId, handleSelectVisit])

  const handleProcessPaymentSubmit = useCallback(
    async (data: ProcessPaymentData) => {
      if (!billingDetails || !session?.user.id) {
        toast.error("Data kunjungan atau detail tagihan tidak valid")
        return
      }
      await processPayment(data, billingDetails.billing.id, session.user.id)
    },
    [billingDetails, session, processPayment]
  )

  const selectedVisitType = queue.find((item) => item.visit.id === selectedVisitId)?.visit.visitType
  const visitConfig = selectedVisitType ? getVisitTypeConfig(selectedVisitType) : null

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100svh - var(--header-height))" }}
    >
      {/* Header with brand accent */}
      <div className="bg-background shrink-0 border-b">
        <div className="h-0.5 bg-gradient-to-r from-[#52b788] to-[#74c69d]" />
        <div className="flex items-center justify-between px-6 py-3.5">
          <div>
            <h1 className="text-lg font-semibold">Kasir & Pembayaran</h1>
            <p className="text-muted-foreground text-xs">Proses pembayaran pasien</p>
          </div>
          {lastRefresh && (
            <div className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
              <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              <span>Diperbarui {new Date(lastRefresh).toLocaleTimeString("id-ID")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <QueueSidebar
          queue={queue}
          isLoading={queueLoading}
          selectedVisitId={selectedVisitId}
          onSelectVisit={handleSelectVisit}
          onRefresh={refreshQueue}
        />

        {/* Combined billing panel — full-width patient header + items/summary below */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Patient header — spans full width of billing panel */}
          {billingDetails && !detailsLoading && (
            <PatientHeader billingDetails={billingDetails} visitConfig={visitConfig} />
          )}

          {/* Items — takes all available height */}
          <BillingItemsPanel
            billingDetails={billingDetails}
            isLoading={detailsLoading || (queueLoading && queue.length === 0)}
          />

          {/* Summary + CTA — anchored at bottom, only shown when there's data or loading */}
          {(detailsLoading || billingDetails) && (
            <BillingDetailsPanel
              billingDetails={billingDetails}
              isLoading={detailsLoading}
              onProcessPaymentWithDiscount={() => setProcessPaymentDialogOpen(true)}
              isSubmitting={isProcessing}
            />
          )}
        </div>
      </div>

      <ProcessPaymentDialog
        open={processPaymentDialogOpen}
        onOpenChange={setProcessPaymentDialogOpen}
        subtotal={subtotal}
        currentTotal={totalAmount}
        paidAmount={paidAmount}
        remainingAmount={remainingAmount}
        drugsSubtotal={drugsSubtotal}
        proceduresSubtotal={proceduresSubtotal}
        onSubmit={handleProcessPaymentSubmit}
        isSubmitting={isProcessing}
      />
    </div>
  )
}
