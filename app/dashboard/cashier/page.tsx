"use client"

/**
 * Cashier Dashboard - Refactored
 * Modular, maintainable cashier interface with improved performance
 * Layout: Queue sidebar (left) + Patient details (right)
 */

import { useState, useCallback } from "react"
import { Clock } from "lucide-react"
import { toast } from "sonner"

import { useBillingQueue } from "@/hooks/use-billing-queue"
import { useBillingDetails } from "@/hooks/use-billing-details"
import { useBillingCalculations } from "@/hooks/use-billing-calculations"
import { useProcessPayment } from "@/hooks/use-process-payment"
import { useSession } from "@/lib/auth-client"
import { ProcessPaymentDialog } from "@/components/billing/process-payment-dialog"
import { QueueSidebar } from "@/components/billing/queue-sidebar"
import { BillingDetailsPanel } from "@/components/billing/billing-details-panel"
import type { ProcessPaymentData } from "@/types/billing"

export default function CashierDashboard() {
  const { data: session } = useSession()
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [processPaymentDialogOpen, setProcessPaymentDialogOpen] = useState(false)

  // Billing queue with auto-refresh
  const {
    queue,
    isLoading: queueLoading,
    lastRefresh,
    refresh: refreshQueue,
  } = useBillingQueue({
    autoRefresh: true,
    refreshInterval: 30000,
  })

  // Billing details for selected visit
  const { billingDetails, fetchBillingDetails, isLoading: detailsLoading } = useBillingDetails()

  // Billing calculations (subtotals, totals)
  const { subtotal, totalAmount, drugsSubtotal, proceduresSubtotal } =
    useBillingCalculations(billingDetails)

  // Payment processing with merged workflow
  const { isProcessing, processPayment } = useProcessPayment({
    onSuccess: () => {
      setProcessPaymentDialogOpen(false)
      refreshQueue()
      if (selectedVisitId) {
        fetchBillingDetails(selectedVisitId)
      }
    },
  })

  // Handlers
  const handleSelectVisit = useCallback(
    (visitId: string) => {
      setSelectedVisitId(visitId)
      fetchBillingDetails(visitId)
    },
    [fetchBillingDetails]
  )

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

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kasir & Pembayaran</h1>
            <p className="text-muted-foreground text-sm">
              Proses pembayaran pasien dengan cepat dan efisien
            </p>
          </div>
          {lastRefresh && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Update: {new Date(lastRefresh).toLocaleTimeString("id-ID")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: 2-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Queue Sidebar */}
        <QueueSidebar
          queue={queue}
          isLoading={queueLoading}
          selectedVisitId={selectedVisitId}
          onSelectVisit={handleSelectVisit}
          onRefresh={refreshQueue}
        />

        {/* RIGHT: Billing Details Panel */}
        <BillingDetailsPanel
          selectedVisitId={selectedVisitId}
          billingDetails={billingDetails}
          isLoading={detailsLoading}
          onRefresh={handleRefreshBillingDetails}
          onProcessPaymentWithDiscount={() => setProcessPaymentDialogOpen(true)}
          isSubmitting={isProcessing}
        />
      </div>

      {/* Process Payment Dialog (Merged Workflow) */}
      <ProcessPaymentDialog
        open={processPaymentDialogOpen}
        onOpenChange={setProcessPaymentDialogOpen}
        subtotal={subtotal}
        currentTotal={totalAmount}
        drugsSubtotal={drugsSubtotal}
        proceduresSubtotal={proceduresSubtotal}
        onSubmit={handleProcessPaymentSubmit}
        isSubmitting={isProcessing}
      />
    </div>
  )
}
