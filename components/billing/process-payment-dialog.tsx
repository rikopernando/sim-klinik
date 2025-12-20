/**
 * Process Payment Dialog Component (Merged Workflow)
 * Handles discount application and payment in a single form
 */

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency, calculateChange } from "@/lib/billing/billing-utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import type { PaymentMethod } from "@/types/billing"
import { ScrollArea } from "../ui/scroll-area"

type DiscountType = "none" | "fixed" | "percentage" | "drugs_only" | "procedures_only"

type PaymentData = {
  discountType: DiscountType
  discountPercentage?: string
  discount?: string
  insuranceCoverage?: string
  paymentMethod: PaymentMethod
  amountReceived?: string
  paymentReference?: string
  notes?: string
}

interface ProcessPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  currentTotal: number
  // Breakdown for specific discounts
  drugsSubtotal?: number
  proceduresSubtotal?: number
  onSubmit: (data: PaymentData) => void
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

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (discountType === "fixed" && discount) {
      return parseFloat(discount) || 0
    } else if (discountType === "percentage" && discountPercentage) {
      const percentage = parseFloat(discountPercentage) || 0
      return (subtotal * percentage) / 100
    } else if (discountType === "drugs_only" && drugsSubtotal) {
      return drugsSubtotal
    } else if (discountType === "procedures_only" && proceduresSubtotal) {
      return proceduresSubtotal
    }
    return 0
  }, [discountType, discountPercentage, discount, subtotal, drugsSubtotal, proceduresSubtotal])

  // Calculate final total after discount and insurance
  const totalAfterDiscount = useMemo(() => {
    return Math.max(0, currentTotal - discountAmount)
  }, [currentTotal, discountAmount])

  const insurance = parseFloat(insuranceCoverage) || 0
  const finalTotal = useMemo(() => {
    return Math.max(0, totalAfterDiscount - insurance)
  }, [totalAfterDiscount, insurance])

  // Calculate change for cash payments
  const changeAmount = useMemo(() => {
    if (paymentMethod === "cash" && amountReceived) {
      return calculateChange(amountReceived, finalTotal.toString())
    }
    return "0"
  }, [paymentMethod, amountReceived, finalTotal])

  // Validation
  const isValidDiscount = discountAmount >= 0 && discountAmount <= currentTotal
  const isValidInsurance = insurance >= 0 && insurance <= totalAfterDiscount
  const isValidTotal = finalTotal >= 0
  const isValidPayment = useMemo(() => {
    if (paymentMethod === "cash") {
      return amountReceived && parseFloat(amountReceived) > 0 && parseFloat(changeAmount) >= 0
    }
    return true
  }, [paymentMethod, amountReceived, changeAmount])

  const isValid = isValidDiscount && isValidInsurance && isValidTotal && isValidPayment

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
                {/* Collapsible Discount Section */}
                <Collapsible open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="flex w-full justify-between" type="button">
                      <span className="font-semibold">Terapkan Diskon & Jaminan</span>
                      {isDiscountOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 pt-4">
                    <Field>
                      <FieldLabel>Tipe Diskon</FieldLabel>
                      <RadioGroup
                        value={discountType}
                        onValueChange={(value) => setDiscountType(value as DiscountType)}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="discount-none" />
                          <Label htmlFor="discount-none">Tanpa Diskon</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="discount-fixed" />
                          <Label htmlFor="discount-fixed">Diskon Nominal (Rp)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="percentage" id="discount-percentage" />
                          <Label htmlFor="discount-percentage">Diskon Persentase (%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="drugs_only" id="discount-drugs" />
                          <Label htmlFor="discount-drugs">
                            Diskon Seluruh Obat ({formatCurrency(drugsSubtotal || 0)})
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="procedures_only" id="discount-procedures" />
                          <Label htmlFor="discount-procedures">
                            Diskon Seluruh Tindakan ({formatCurrency(proceduresSubtotal || 0)})
                          </Label>
                        </div>
                      </RadioGroup>
                    </Field>

                    {discountType === "fixed" && (
                      <Field>
                        <FieldLabel htmlFor="discount">Nominal Diskon (Rp)</FieldLabel>
                        <CurrencyInput
                          id="discount"
                          value={discount}
                          onValueChange={setDiscount}
                          placeholder="0"
                          disabled={isSubmitting}
                          min="0"
                          max={currentTotal}
                        />
                        {!isValidDiscount && (
                          <FieldDescription className="text-red-600">
                            Diskon tidak boleh melebihi total
                          </FieldDescription>
                        )}
                      </Field>
                    )}

                    {discountType === "percentage" && (
                      <Field>
                        <FieldLabel htmlFor="discountPercentage">Persentase Diskon (%)</FieldLabel>
                        <CurrencyInput
                          id="discountPercentage"
                          value={discountPercentage}
                          onValueChange={setDiscountPercentage}
                          placeholder="0"
                          disabled={isSubmitting}
                          min="0"
                          max="100"
                        />
                        {discountPercentage && parseFloat(discountPercentage) > 0 && (
                          <FieldDescription>
                            Diskon: {formatCurrency(discountAmount)}
                          </FieldDescription>
                        )}
                      </Field>
                    )}

                    {/* Insurance Coverage Field */}
                    <Field>
                      <FieldLabel htmlFor="insuranceCoverage">
                        Ditanggung Asuransi/Jaminan (Rp)
                      </FieldLabel>
                      <CurrencyInput
                        id="insuranceCoverage"
                        value={insuranceCoverage}
                        onValueChange={setInsuranceCoverage}
                        placeholder="0"
                        disabled={isSubmitting}
                        min="0"
                        max={totalAfterDiscount}
                      />
                      {!isValidInsurance && (
                        <FieldDescription className="text-red-600">
                          Jaminan tidak boleh melebihi total setelah diskon
                        </FieldDescription>
                      )}
                    </Field>
                  </CollapsibleContent>
                </Collapsible>

                {/* Payment Section (Always Visible) */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Pembayaran</h3>

                  <Field>
                    <FieldLabel htmlFor="paymentMethod">Metode Pembayaran</FieldLabel>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {paymentMethod === "cash" && (
                    <Field>
                      <FieldLabel htmlFor="amountReceived">Uang Diterima</FieldLabel>
                      <CurrencyInput
                        id="amountReceived"
                        value={amountReceived}
                        onValueChange={setAmountReceived}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                      {amountReceived && (
                        <FieldDescription>
                          <div
                            className={`rounded-lg p-4 ${
                              parseFloat(changeAmount) >= 0 ? "bg-blue-50" : "bg-red-50"
                            }`}
                          >
                            <p className="text-sm text-blue-700">Kembalian</p>
                            <p
                              className={`text-xl font-bold ${
                                parseFloat(changeAmount) >= 0 ? "text-blue-900" : "text-red-700"
                              }`}
                            >
                              {formatCurrency(changeAmount)}
                            </p>
                            {parseFloat(changeAmount) < 0 && (
                              <p className="mt-1 text-xs text-red-600">
                                Uang yang diterima kurang!
                              </p>
                            )}
                          </div>
                        </FieldDescription>
                      )}
                    </Field>
                  )}

                  {paymentMethod !== "cash" && (
                    <Field>
                      <FieldLabel htmlFor="paymentReference">Nomor Referensi</FieldLabel>
                      <Input
                        id="paymentReference"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Nomor transfer / kartu / klaim"
                        disabled={isSubmitting}
                      />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan tambahan (opsional)"
                      disabled={isSubmitting}
                    />
                  </Field>
                </div>

                {/* Billing Summary - Bottom */}
                <div className="bg-muted/50 rounded-lg border p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountType !== "none" && (
                      <div className="flex justify-between text-red-600">
                        <span>
                          Diskon
                          {discountType === "drugs_only" && " (Obat)"}
                          {discountType === "procedures_only" && " (Tindakan)"}
                        </span>
                        <span>- {formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    {insurance > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Ditanggung Asuransi</span>
                        <span>- {formatCurrency(insurance)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total Dibayar Pasien</span>
                      <span className={finalTotal < 0 ? "text-red-600" : ""}>
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                    {!isValidTotal && (
                      <p className="text-xs text-red-600">
                        Total tidak valid, periksa kembali input
                      </p>
                    )}
                  </div>
                </div>

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
