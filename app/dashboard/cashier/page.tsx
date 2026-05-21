"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as dateLocale } from "date-fns/locale"

import { useBillingQueue } from "@/hooks/use-billing-queue"
import { useBillingDetails } from "@/hooks/use-billing-details"
import { useBillingCalculations } from "@/hooks/use-billing-calculations"
import { useProcessPayment } from "@/hooks/use-process-payment"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { ProcessPaymentDialog } from "@/components/billing/process-payment-dialog"
import { QueueSidebar } from "@/components/billing/queue-sidebar"
import { BillingItemsPanel } from "@/components/billing/billing-items-panel"
import { BillingDetailsPanel } from "@/components/billing/billing-details-panel"
import type { ProcessPaymentData } from "@/types/billing"
import { PageGuard } from "@/components/auth/page-guard"

const VISIT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  outpatient: {
    label: "Rawat Jalan",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  inpatient: {
    label: "Rawat Inap",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  emergency: {
    label: "UGD",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

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

  const handleRefreshBillingDetails = useCallback(() => {
    if (selectedVisitId) {
      fetchBillingDetails(selectedVisitId)
    }
  }, [selectedVisitId, fetchBillingDetails])

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
  const visitConfig = selectedVisitType
    ? (VISIT_TYPE_CONFIG[selectedVisitType] ?? {
        label: selectedVisitType,
        className: "bg-muted text-muted-foreground",
      })
    : null

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
              <div className="h-1.5 w-1.5 rounded-full bg-[#52b788]" />
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
            <div className="bg-muted/20 shrink-0 border-b px-5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{billingDetails.patient.name}</p>
                    {visitConfig && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          visitConfig.className
                        )}
                      >
                        {visitConfig.label}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                    <span>{billingDetails.patient.mrNumber}</span>
                    <span>·</span>
                    <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {billingDetails.visit.visitNumber}
                    </span>
                    <span>·</span>
                    <span>
                      {format(new Date(billingDetails.visit.createdAt), "dd MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-widest uppercase">
                  {billingDetails.items.length} item
                </p>
              </div>
            </div>
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
              onRefresh={handleRefreshBillingDetails}
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
