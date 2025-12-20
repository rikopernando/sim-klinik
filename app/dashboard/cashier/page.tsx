"use client"

/**
 * Cashier Dashboard - Refactored
 * Modular, maintainable cashier interface with improved performance
 * Layout: Queue sidebar (left) + Patient details (right)
 */

import { toast } from "sonner"
import { useState, useCallback, useMemo } from "react"
import { Clock } from "lucide-react"

import { useBillingQueue } from "@/hooks/use-billing-queue"
import { useBillingDetails } from "@/hooks/use-billing-details"
import { useSession } from "@/lib/auth-client"
import { ProcessPaymentDialog } from "@/components/billing/process-payment-dialog"
import { QueueSidebar } from "@/components/billing/queue-sidebar"
import { BillingDetailsPanel } from "@/components/billing/billing-details-panel"
import { processPaymentWithDiscount } from "@/lib/services/billing.service"
import type { PaymentMethod } from "@/types/billing"

type PaymentData = {
  discountType: string
  discountPercentage?: string
  discount?: string
  insuranceCoverage?: string
  paymentMethod: PaymentMethod
  amountReceived?: string
  amount: string
  paymentReference?: string
  notes?: string
}

export default function CashierDashboard() {
  const { data: session } = useSession()
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [processPaymentDialogOpen, setProcessPaymentDialogOpen] = useState(false)
  const [isProcessingMerged, setIsProcessingMerged] = useState(false)

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

  const handleSelectVisit = (visitId: string) => {
    setSelectedVisitId(visitId)
    fetchBillingDetails(visitId)
  }

  const currentSubtotal = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(billingDetails.billing.subtotal)
  }, [billingDetails])

  const currentTotal = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(billingDetails.billing.totalAmount)
  }, [billingDetails])

  // Calculate drugs and procedures subtotals
  const drugsSubtotal = useMemo(() => {
    if (!billingDetails) return 0
    return billingDetails.items
      .filter((item) => item.itemType === "drug")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
  }, [billingDetails])

  const proceduresSubtotal = useMemo(() => {
    if (!billingDetails) return 0
    return billingDetails.items
      .filter((item) => item.itemType === "service")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
  }, [billingDetails])

  // Handle merged payment submission (discount + payment in one step)
  const handleProcessPaymentSubmit = useCallback(
    async (data: PaymentData) => {
      if (!billingDetails || !selectedVisitId || !session?.user.id) {
        toast.error("Data kunjungan atau detail tagihan tidak valid")
        return
      }

      setIsProcessingMerged(true)

      try {
        await processPaymentWithDiscount({
          billingId: billingDetails.billing.id,
          discount: data.discount,
          discountPercentage: data.discountPercentage,
          insuranceCoverage: data.insuranceCoverage,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          amountReceived: data.amountReceived,
          paymentReference: data.paymentReference,
          receivedBy: session.user.id,
          notes: data.notes,
        })

        toast.success("Pembayaran berhasil diproses")
        setProcessPaymentDialogOpen(false)
        refreshQueue()
        if (selectedVisitId) {
          fetchBillingDetails(selectedVisitId)
        }
      } catch (error) {
        // Error already handled by service
        console.error("Process payment error:", error)
        toast.error("Terjadi kesalahan saat memproses pembayaran")
      } finally {
        setIsProcessingMerged(false)
      }
    },
    [billingDetails, selectedVisitId, session, refreshQueue, fetchBillingDetails]
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
          onRefresh={() => selectedVisitId && fetchBillingDetails(selectedVisitId)}
          onProcessPaymentWithDiscount={() => setProcessPaymentDialogOpen(true)}
          isSubmitting={isProcessingMerged}
        />
      </div>

      {/* Process Payment Dialog (Merged Workflow) */}
      <ProcessPaymentDialog
        open={processPaymentDialogOpen}
        onOpenChange={setProcessPaymentDialogOpen}
        subtotal={currentSubtotal}
        currentTotal={currentTotal}
        drugsSubtotal={drugsSubtotal}
        proceduresSubtotal={proceduresSubtotal}
        onSubmit={handleProcessPaymentSubmit}
        isSubmitting={isProcessingMerged}
      />
    </div>
  )
}
