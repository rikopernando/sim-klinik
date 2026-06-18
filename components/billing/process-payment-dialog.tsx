"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useDiscountCalculation, type DiscountType } from "@/hooks/use-discount-calculation"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ProcessPaymentData, PaymentMethod } from "@/types/billing"
import { DiscountSection } from "./process-payment/discount-section"
import { PaymentMethodSection } from "./process-payment/payment-method-section"
import { BillingSummarySection } from "./process-payment/billing-summary-section"

interface ProcessPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  currentTotal: number
  paidAmount: number
  remainingAmount: number
  drugsSubtotal?: number
  proceduresSubtotal?: number
  onSubmit: (data: ProcessPaymentData) => void
  isSubmitting?: boolean
}

export function ProcessPaymentDialog({
  open,
  onOpenChange,
  subtotal,
  currentTotal,
  paidAmount,
  remainingAmount,
  drugsSubtotal,
  proceduresSubtotal,
  onSubmit,
  isSubmitting = false,
}: ProcessPaymentDialogProps) {
  const isMobile = useIsMobile()

  const [isDiscountOpen, setIsDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<DiscountType>("none")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [discount, setDiscount] = useState("")
  const [insuranceCoverage, setInsuranceCoverage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [notes, setNotes] = useState("")

  const {
    discountAmount,
    totalAfterDiscount,
    insurance,
    finalTotal,
    changeAmount,
    isValidDiscount,
    isValidInsurance,
    isValidTotal,
    isValid,
  } = useDiscountCalculation({
    discountType,
    discount,
    discountPercentage,
    insuranceCoverage,
    subtotal,
    currentTotal,
    paidAmount,
    remainingAmount,
    drugsSubtotal,
    proceduresSubtotal,
    paymentMethod,
    amountReceived,
  })

  const handleSubmit = () => {
    if (!isValid) return

    let finalDiscount = undefined
    if (discountType === "fixed") {
      finalDiscount = discount
    } else if (discountType === "drugs_only") {
      finalDiscount = drugsSubtotal?.toString()
    } else if (discountType === "procedures_only") {
      finalDiscount = proceduresSubtotal?.toString()
    }

    onSubmit({
      discountType,
      discountPercentage: discountType === "percentage" ? discountPercentage : undefined,
      discount: finalDiscount,
      insuranceCoverage: insurance > 0 ? insuranceCoverage : undefined,
      paymentMethod,
      amountReceived: paymentMethod === "cash" ? amountReceived : undefined,
      paymentReference: paymentMethod !== "cash" && paymentReference ? paymentReference : undefined,
      notes: notes || undefined,
      amount: finalTotal.toString(),
    })
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsDiscountOpen(false)
      setDiscountType("none")
      setDiscountPercentage("")
      setDiscount("")
      setInsuranceCoverage("")
      setPaymentMethod("cash")
      setAmountReceived("")
      setPaymentReference("")
      setNotes("")
      onOpenChange(false)
    }
  }

  const hasPartialPayment = paidAmount > 0
  const description = hasPartialPayment
    ? "Lanjutkan pembayaran untuk sisa tagihan"
    : "Proses pembayaran dengan atau tanpa diskon dalam satu langkah"

  // Shared form content used in both Drawer (mobile) and Dialog (desktop)
  const formSections = (
    <div className="space-y-4">
      {!hasPartialPayment && (
        <DiscountSection
          isOpen={isDiscountOpen}
          onOpenChange={setIsDiscountOpen}
          discountType={discountType}
          onDiscountTypeChange={setDiscountType}
          discount={discount}
          onDiscountChange={setDiscount}
          discountPercentage={discountPercentage}
          onDiscountPercentageChange={setDiscountPercentage}
          insuranceCoverage={insuranceCoverage}
          onInsuranceCoverageChange={setInsuranceCoverage}
          discountAmount={discountAmount}
          currentTotal={currentTotal}
          totalAfterDiscount={totalAfterDiscount}
          drugsSubtotal={drugsSubtotal}
          proceduresSubtotal={proceduresSubtotal}
          isValidDiscount={isValidDiscount}
          isValidInsurance={isValidInsurance}
          isSubmitting={isSubmitting}
        />
      )}
      <PaymentMethodSection
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        amountReceived={amountReceived}
        onAmountReceivedChange={setAmountReceived}
        paymentReference={paymentReference}
        onPaymentReferenceChange={setPaymentReference}
        notes={notes}
        onNotesChange={setNotes}
        changeAmount={changeAmount}
        isSubmitting={isSubmitting}
      />
      <BillingSummarySection
        subtotal={subtotal}
        discountType={discountType}
        discountAmount={discountAmount}
        insurance={insurance}
        paidAmount={paidAmount}
        finalTotal={finalTotal}
        isValidTotal={isValidTotal}
      />
    </div>
  )

  // Mobile: bottom sheet drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose} dismissible={!isSubmitting}>
        <DrawerContent className="flex flex-col">
          <DrawerHeader className="shrink-0 border-b px-4 pb-4 text-left">
            <DrawerTitle>Proses Pembayaran</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">{formSections}</div>

          <div className="bg-background shrink-0 border-t px-4 pt-3 pb-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isValid}
              className="mb-2 w-full"
            >
              {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full"
            >
              Batal
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop: center modal with sticky footer
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 p-0">
        <div className="shrink-0 border-b px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">{formSections}</div>

        <div className="bg-background flex shrink-0 justify-end gap-2 border-t px-6 py-4">
          <Button onClick={handleClose} variant="outline" disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
