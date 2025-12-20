/**
 * Payment Method Section Component
 * Handles payment method selection and related inputs
 */

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { PaymentMethod } from "@/types/billing"

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  amountReceived: string
  onAmountReceivedChange: (value: string) => void
  paymentReference: string
  onPaymentReferenceChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  changeAmount: string
  isSubmitting: boolean
}

export function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
  amountReceived,
  onAmountReceivedChange,
  paymentReference,
  onPaymentReferenceChange,
  notes,
  onNotesChange,
  changeAmount,
  isSubmitting,
}: PaymentMethodSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Pembayaran</h3>

      {/* Payment Method Selection */}
      <Field>
        <FieldLabel htmlFor="paymentMethod">Metode Pembayaran</FieldLabel>
        <Select
          value={paymentMethod}
          onValueChange={(value) => onPaymentMethodChange(value as PaymentMethod)}
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

      {/* Cash Payment: Amount Received */}
      {paymentMethod === "cash" && (
        <Field>
          <FieldLabel htmlFor="amountReceived">Uang Diterima</FieldLabel>
          <CurrencyInput
            id="amountReceived"
            value={amountReceived}
            onValueChange={onAmountReceivedChange}
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
                  <p className="mt-1 text-xs text-red-600">Uang yang diterima kurang!</p>
                )}
              </div>
            </FieldDescription>
          )}
        </Field>
      )}

      {/* Non-Cash Payment: Payment Reference */}
      {paymentMethod !== "cash" && (
        <Field>
          <FieldLabel htmlFor="paymentReference">Nomor Referensi</FieldLabel>
          <Input
            id="paymentReference"
            value={paymentReference}
            onChange={(e) => onPaymentReferenceChange(e.target.value)}
            placeholder="Nomor transfer / kartu / klaim"
            disabled={isSubmitting}
          />
        </Field>
      )}

      {/* Notes Field */}
      <Field>
        <FieldLabel htmlFor="notes">Catatan</FieldLabel>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          disabled={isSubmitting}
        />
      </Field>
    </div>
  )
}
