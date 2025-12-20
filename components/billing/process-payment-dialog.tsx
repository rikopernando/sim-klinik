/**
 * Process Payment Dialog Component (Merged Workflow) - Refactored
 * Handles discount application and payment in a single form
 * Refactored for better modularity and maintainability
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldSet } from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDiscountCalculation, type DiscountType } from "@/hooks/use-discount-calculation"
import type { ProcessPaymentData, PaymentMethod } from "@/types/billing"
import { DiscountSection } from "./process-payment/discount-section"
import { PaymentMethodSection } from "./process-payment/payment-method-section"
import { BillingSummarySection } from "./process-payment/billing-summary-section"

interface ProcessPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  currentTotal: number
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
  drugsSubtotal,
  proceduresSubtotal,
  onSubmit,
  isSubmitting = false,
}: ProcessPaymentDialogProps) {
  // UI state
  const [isDiscountOpen, setIsDiscountOpen] = useState(false)

  // Discount state
  const [discountType, setDiscountType] = useState<DiscountType>("none")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [discount, setDiscount] = useState("")
  const [insuranceCoverage, setInsuranceCoverage] = useState("")

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [notes, setNotes] = useState("")

  // Calculate all totals and validate using custom hook
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
    drugsSubtotal,
    proceduresSubtotal,
    paymentMethod,
    amountReceived,
  })

  // Handle form submission
  const handleSubmit = () => {
    if (!isValid) return

    onSubmit({
      discountType,
      discountPercentage: discountType === "percentage" ? discountPercentage : undefined,
      discount: discountType === "fixed" ? discount : undefined,
      insuranceCoverage: insurance > 0 ? insuranceCoverage : undefined,
      paymentMethod,
      amountReceived: paymentMethod === "cash" ? amountReceived : undefined,
      paymentReference: paymentMethod !== "cash" && paymentReference ? paymentReference : undefined,
      notes: notes || undefined,
      amount: finalTotal.toString(),
    })
  }

  // Reset form when closing
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-165 max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proses Pembayaran</DialogTitle>
          <DialogDescription>
            Proses pembayaran dengan atau tanpa diskon dalam satu langkah
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <FieldGroup>
            <FieldSet>
              <FieldGroup className="gap-4">
                {/* Discount Section (Collapsible) */}
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

                {/* Payment Method Section */}
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

                {/* Billing Summary */}
                <BillingSummarySection
                  subtotal={subtotal}
                  discountType={discountType}
                  discountAmount={discountAmount}
                  insurance={insurance}
                  finalTotal={finalTotal}
                  isValidTotal={isValidTotal}
                />

                {/* Action Buttons */}
                <Field orientation="horizontal">
                  <div className="flex w-full gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isValid}
                      className="flex-1"
                    >
                      {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
                    </Button>
                    <Button onClick={handleClose} variant="outline" disabled={isSubmitting}>
                      Batal
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
