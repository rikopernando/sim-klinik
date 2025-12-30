/**
 * Material Form Fields Components
 * Reusable form field components for material recording
 */

import { memo } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ServiceSearch } from "@/components/medical-records/service-search"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { Service } from "@/hooks/use-service-search"
import { CurrencyInput } from "@/components/ui/currency-input"

interface MaterialFormData {
  serviceId: string // NEW: Service ID for service-based approach
  materialName: string
  quantity: string
  unitPrice: string
  notes?: string
}

interface MaterialSearchFieldProps {
  form: UseFormReturn<MaterialFormData>
  value: string
  onChange: (value: string) => void
  onMaterialSelect: (material: Service) => void
}

export const MaterialSearchField = memo(function MaterialSearchField({
  form,
  value,
  onChange,
  onMaterialSelect,
}: MaterialSearchFieldProps) {
  return (
    <Field>
      <Controller
        control={form.control}
        name="materialName"
        render={({ fieldState }) => {
          return (
            <>
              <ServiceSearch
                value={value}
                onChange={onChange}
                onSelect={onMaterialSelect}
                label="Cari Alat Kesehatan"
                placeholder="Ketik nama alat kesehatan..."
                serviceType="material"
                required
              />
              {fieldState.error?.message && fieldState.invalid && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </>
          )
        }}
      />
    </Field>
  )
})

interface QuantityUnitFieldsProps {
  form: UseFormReturn<MaterialFormData>
}

export const QuantityUnitFields = memo(function QuantityUnitFields({
  form,
}: QuantityUnitFieldsProps) {
  return (
    <Field>
      <FieldLabel htmlFor="quantity">
        Jumlah <span className="text-destructive">*</span>
      </FieldLabel>
      <Controller
        control={form.control}
        name="quantity"
        render={({ field, fieldState }) => (
          <>
            <CurrencyInput
              min="1"
              id="quantity"
              placeholder="1"
              value={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.error?.message && fieldState.invalid && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </>
        )}
      />
    </Field>
  )
})

interface PriceFieldsProps {
  form: UseFormReturn<MaterialFormData>
  totalPrice: string
}

export const PriceFields = memo(function PriceFields({ form, totalPrice }: PriceFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Unit Price */}
      <Field>
        <FieldLabel htmlFor="unitPrice">
          Harga Satuan (Rp) <span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          control={form.control}
          name="unitPrice"
          render={({ field, fieldState }) => (
            <>
              <Input
                id="unitPrice"
                type="text"
                value={formatCurrency(parseFloat(field.value || "0"))}
                readOnly
                className="bg-muted"
              />
              {fieldState.error?.message && fieldState.invalid && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </>
          )}
        />
      </Field>

      {/* Total Price (Read-only, Auto-calculated) */}
      <Field>
        <FieldLabel htmlFor="totalPrice">Total Harga (Rp)</FieldLabel>
        <Input
          id="totalPrice"
          type="text"
          value={formatCurrency(parseFloat(totalPrice))}
          readOnly
          disabled
          className="bg-muted font-semibold"
        />
      </Field>
    </div>
  )
})

interface NotesFieldProps {
  form: UseFormReturn<MaterialFormData>
}

export const NotesField = memo(function NotesField({ form }: NotesFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="notes">Catatan (Opsional)</FieldLabel>
      <Controller
        control={form.control}
        name="notes"
        render={({ field }) => (
          <Textarea
            id="notes"
            placeholder="Catatan tambahan tentang penggunaan alat kesehatan..."
            rows={3}
            {...field}
          />
        )}
      />
    </Field>
  )
})
