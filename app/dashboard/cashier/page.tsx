"use client"

/**
 * Cashier Dashboard - Refactored
 * Modular, maintainable cashier interface with improved performance
 * Layout: Queue sidebar (left) + Patient details (right)
 */

import { toast } from "sonner"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Clock } from "lucide-react"

import { useBillingQueue } from "@/hooks/use-billing-queue"
import { useBillingDetails } from "@/hooks/use-billing-details"
import { usePayment, type PaymentInput } from "@/hooks/use-payment"
import { useBilling } from "@/hooks/use-billing"
import { useSession } from "@/lib/auth-client"
import { PaymentDialog } from "@/components/billing/payment-dialog"
import { DiscountDialog } from "@/components/billing/discount-dialog"
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
  paymentReference?: string
  notes?: string
}

export default function CashierDashboard() {
  const { data: session } = useSession()
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
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

  // Payment processing
  const { processPayment, isSubmitting, success, resetPayment } = usePayment()

  // Billing calculation (for discount/insurance)
  const { calculateBilling, isSubmitting: isCalculating, success: calculateSuccess } = useBilling()

  const handleSelectVisit = (visitId: string) => {
    setSelectedVisitId(visitId)
    fetchBillingDetails(visitId)
  }

  // Calculate remaining amount and subtotal using useMemo for performance
  const remainingAmount = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(
      billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable
    )
  }, [billingDetails])

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

  // Refresh after successful payment
  useEffect(() => {
    if (success && selectedVisitId) {
      refreshQueue()
      setPaymentDialogOpen(false)
      resetPayment()
    }
  }, [success, selectedVisitId, refreshQueue, resetPayment])

  // Refresh after successful discount calculation
  useEffect(() => {
    if (calculateSuccess && selectedVisitId) {
      refreshQueue()
      setDiscountDialogOpen(false)
    }
  }, [calculateSuccess, selectedVisitId, refreshQueue])

  // Handle payment submission
  const handlePaymentSubmit = useCallback(
    async (data: { paymentMethod: PaymentMethod; amountReceived?: string; notes?: string }) => {
      if (!billingDetails || !selectedVisitId) return

      const paymentData: PaymentInput = {
        visitId: selectedVisitId,
        amount: remainingAmount,
        paymentMethod: data.paymentMethod,
        paymentReference: undefined,
        amountReceived: data.amountReceived ? parseFloat(data.amountReceived) : undefined,
        notes: data.notes,
      }

      await processPayment(paymentData)
    },
    [billingDetails, selectedVisitId, remainingAmount, processPayment]
  )

  // Handle discount submission
  const handleDiscountSubmit = useCallback(
    async (data: {
      discount?: number
      discountPercentage?: number
      insuranceCoverage?: number
    }) => {
      if (!selectedVisitId) return

      await calculateBilling({
        visitId: selectedVisitId,
        discount: data.discount,
        discountPercentage: data.discountPercentage,
        insuranceCoverage: data.insuranceCoverage,
      })
    },
    [selectedVisitId, calculateBilling]
  )

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
          amount: remainingAmount.toString(),
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
    [billingDetails, selectedVisitId, session, remainingAmount, refreshQueue, fetchBillingDetails]
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
          onProcessPayment={() => setPaymentDialogOpen(true)}
          onApplyDiscount={() => setDiscountDialogOpen(true)}
          onProcessPaymentWithDiscount={() => setProcessPaymentDialogOpen(true)}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Discount Dialog */}
      <DiscountDialog
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
        currentSubtotal={currentSubtotal}
        currentDiscount={billingDetails ? parseFloat(billingDetails.billing.discount) : 0}
        currentDiscountPercentage={
          billingDetails && billingDetails.billing.discountPercentage
            ? parseFloat(billingDetails.billing.discountPercentage)
            : 0
        }
        currentInsuranceCoverage={
          billingDetails ? parseFloat(billingDetails.billing.insuranceCoverage) : 0
        }
        drugsSubtotal={drugsSubtotal}
        proceduresSubtotal={proceduresSubtotal}
        onSubmit={handleDiscountSubmit}
        isSubmitting={isCalculating}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        remainingAmount={remainingAmount}
        onSubmit={handlePaymentSubmit}
        isSubmitting={isSubmitting}
      />

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
