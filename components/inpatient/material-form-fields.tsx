/**
 * Material Form Fields Components
 * Reusable form field components for material recording
 * Uses unified inventory system
 */

import { memo } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { MaterialSearch } from "./material-search"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { Material } from "@/types/material"
import { CurrencyInput } from "@/components/ui/currency-input"

interface MaterialFormData {
  itemId: string // Unified inventory item ID
  materialName: string
  unit: string
  quantity: string
  unitPrice: string
  availableStock?: number
  notes?: string
}

interface MaterialSearchFieldProps {
  form: UseFormReturn<MaterialFormData>
  value: string
  onChange: (value: string) => void
  onMaterialSelect: (material: Material) => void
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
            <MaterialSearch
              value={value}
              onChange={onChange}
              onSelect={onMaterialSelect}
              label="Material / Alat Kesehatan"
              placeholder="Ketik nama material atau alat kesehatan..."
              required
              error={fieldState.error?.message}
            />
          )
        }}
      />
    </Field>
  )
})

interface QuantityUnitFieldsProps {
  values: MaterialFormData
  form: UseFormReturn<MaterialFormData>
}

export const QuantityUnitFields = memo(function QuantityUnitFields({
  form,
  values,
}: QuantityUnitFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Quantity */}
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
              {values.availableStock !== undefined && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Stok tersedia:{" "}
                  <span className="font-medium">
                    {values.availableStock} {values.unit}
                  </span>
                </p>
              )}
            </>
          )}
        />
      </Field>

      {/* Unit (Read-only) */}
      <Field>
        <FieldLabel htmlFor="unit">Satuan</FieldLabel>
        <Controller
          name="unit"
          control={form.control}
          render={({ field }) => (
            <Input {...field} readOnly className="bg-muted" placeholder="Satuan" />
          )}
        />
      </Field>
    </div>
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
      <FieldLabel htmlFor="notes">Catatan</FieldLabel>
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
