/**
 * Inventory Form Fields Component (Refactored with react-hook-form)
 * Reusable form fields for inventory management using Controller
 */

"use client"

import { Control, Controller, FieldErrors } from "react-hook-form"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel, FieldError } from "@/components/ui/field"

export interface InventoryFormData {
  drugId: string
  drugName: string
  drugUnit: string
  batchNumber: string
  expiryDate: Date
  stockQuantity: number
  purchasePrice?: string
  supplier?: string
  receivedDate: Date
}

interface InventoryFormFieldsProps {
  control: Control<InventoryFormData>
  errors: FieldErrors<InventoryFormData>
  disabled?: boolean
}

const currentYear = new Date().getFullYear() + 20

export function InventoryFormFields({
  control,
  errors,
  disabled = false,
}: InventoryFormFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Batch Number */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="batchNumber">
              Nomor Batch <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="batchNumber"
              render={({ field }) => (
                <Input
                  id="batchNumber"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Masukkan nomor batch dari kemasan"
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.batchNumber]} />
          </FieldContent>
        </Field>
      </div>

      {/* Expiry Date */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <Controller
              control={control}
              name="expiryDate"
              render={({ field }) => (
                <DatePickerField
                  required
                  label="Tanggal Kadaluarsa"
                  value={field.value}
                  onChange={field.onChange}
                  endMonth={new Date(currentYear, 12)}
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.expiryDate]} />
          </FieldContent>
        </Field>
      </div>

      {/* Stock Quantity */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="stockQuantity">
              Jumlah Stok <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="stockQuantity"
              render={({ field }) => (
                <Input
                  id="stockQuantity"
                  type="number"
                  min="1"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  onBlur={field.onBlur}
                  placeholder="Masukkan jumlah"
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.stockQuantity]} />
          </FieldContent>
        </Field>
      </div>

      {/* Unit (Display Only) */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="unit">Satuan</FieldLabel>
            <Controller
              control={control}
              name="drugUnit"
              render={({ field }) => (
                <Input
                  id="unit"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Satuan"
                  disabled
                />
              )}
            />
          </FieldContent>
        </Field>
      </div>

      {/* Purchase Price */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="purchasePrice">Harga Beli</FieldLabel>
            <Controller
              control={control}
              name="purchasePrice"
              render={({ field }) => (
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="0.00"
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.purchasePrice]} />
          </FieldContent>
        </Field>
      </div>

      {/* Supplier */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="supplier">Supplier</FieldLabel>
            <Controller
              control={control}
              name="supplier"
              render={({ field }) => (
                <Input
                  id="supplier"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Nama supplier"
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.supplier]} />
          </FieldContent>
        </Field>
      </div>

      {/* Received Date */}
      <div className="col-span-2 md:col-span-1">
        <Field>
          <FieldContent>
            <Controller
              control={control}
              name="receivedDate"
              render={({ field }) => (
                <DatePickerField
                  label="Tanggal Terima"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
            <FieldError errors={[errors.receivedDate]} />
          </FieldContent>
        </Field>
      </div>
    </div>
  )
}
