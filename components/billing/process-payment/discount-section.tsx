/**
 * Discount Section Component
 * Collapsible section for discount and insurance input
 */

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/ui/currency-input"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { DiscountType } from "@/hooks/use-discount-calculation"

interface DiscountSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  discountType: DiscountType
  onDiscountTypeChange: (type: DiscountType) => void
  discount: string
  onDiscountChange: (value: string) => void
  discountPercentage: string
  onDiscountPercentageChange: (value: string) => void
  insuranceCoverage: string
  onInsuranceCoverageChange: (value: string) => void
  discountAmount: number
  currentTotal: number
  totalAfterDiscount: number
  drugsSubtotal?: number
  proceduresSubtotal?: number
  isValidDiscount: boolean
  isValidInsurance: boolean
  isSubmitting: boolean
}

export function DiscountSection({
  isOpen,
  onOpenChange,
  discountType,
  onDiscountTypeChange,
  discount,
  onDiscountChange,
  discountPercentage,
  onDiscountPercentageChange,
  insuranceCoverage,
  onInsuranceCoverageChange,
  discountAmount,
  currentTotal,
  totalAfterDiscount,
  drugsSubtotal,
  proceduresSubtotal,
  isValidDiscount,
  isValidInsurance,
  isSubmitting,
}: DiscountSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex w-full justify-between" type="button">
          <span className="font-semibold">Terapkan Diskon & Jaminan</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-4">
        {/* Discount Type Selection */}
        <Field>
          <FieldLabel>Tipe Diskon</FieldLabel>
          <RadioGroup
            value={discountType}
            onValueChange={(value) => onDiscountTypeChange(value as DiscountType)}
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

        {/* Fixed Discount Input */}
        {discountType === "fixed" && (
          <Field>
            <FieldLabel htmlFor="discount">Nominal Diskon (Rp)</FieldLabel>
            <CurrencyInput
              id="discount"
              value={discount}
              onValueChange={onDiscountChange}
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

        {/* Percentage Discount Input */}
        {discountType === "percentage" && (
          <Field>
            <FieldLabel htmlFor="discountPercentage">Persentase Diskon (%)</FieldLabel>
            <CurrencyInput
              id="discountPercentage"
              value={discountPercentage}
              onValueChange={onDiscountPercentageChange}
              placeholder="0"
              disabled={isSubmitting}
              min="0"
              max="100"
            />
            {discountPercentage && parseFloat(discountPercentage) > 0 && (
              <FieldDescription>Diskon: {formatCurrency(discountAmount)}</FieldDescription>
            )}
          </Field>
        )}

        {/* Insurance Coverage Input */}
        <Field>
          <FieldLabel htmlFor="insuranceCoverage">Ditanggung Asuransi/Jaminan (Rp)</FieldLabel>
          <CurrencyInput
            id="insuranceCoverage"
            value={insuranceCoverage}
            onValueChange={onInsuranceCoverageChange}
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
  )
}
