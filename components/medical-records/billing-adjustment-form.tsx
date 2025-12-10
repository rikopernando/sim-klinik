/**
 * Billing Adjustment Form Component
 * Allows adding discounts or surcharges with notes
 */

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CurrencyInput } from "@/components/ui/currency-input"

interface BillingAdjustmentFormProps {
  adjustmentType: "none" | "discount" | "surcharge"
  adjustmentAmount: string
  adjustmentNote: string
  onAdjustmentTypeChange: (type: "none" | "discount" | "surcharge") => void
  onAdjustmentAmountChange: (amount: string) => void
  onAdjustmentNoteChange: (note: string) => void
}

export function BillingAdjustmentForm({
  adjustmentType,
  adjustmentAmount,
  adjustmentNote,
  onAdjustmentTypeChange,
  onAdjustmentAmountChange,
  onAdjustmentNoteChange,
}: BillingAdjustmentFormProps) {
  return (
    <>
      {/* Adjustment Type */}
      <div className="space-y-2">
        <Label>Penyesuaian Billing (Opsional)</Label>
        <RadioGroup value={adjustmentType} onValueChange={onAdjustmentTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="adj-none" />
            <Label htmlFor="adj-none" className="font-normal">
              Tanpa Penyesuaian
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="discount" id="adj-discount" />
            <Label htmlFor="adj-discount" className="font-normal">
              Berikan Diskon
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="surcharge" id="adj-surcharge" />
            <Label htmlFor="adj-surcharge" className="font-normal">
              Tambahkan Biaya
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Amount and Note Inputs */}
      {adjustmentType !== "none" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="adjustment-amount">
              {adjustmentType === "discount" ? "Nominal Diskon (Rp)" : "Nominal Tambahan (Rp)"}
            </Label>
            <CurrencyInput
              id="adjustment-amount"
              value={adjustmentAmount}
              onValueChange={onAdjustmentAmountChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-note">Keterangan (Opsional)</Label>
            <Textarea
              id="adjustment-note"
              value={adjustmentNote}
              onChange={(e) => onAdjustmentNoteChange(e.target.value)}
              placeholder="Alasan penyesuaian billing..."
              rows={2}
            />
          </div>
        </>
      )}
    </>
  )
}
