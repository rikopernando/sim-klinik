/**
 * Prescription Form Item Component
 * Single prescription item in the array (memoized for performance)
 */

"use client"

import { memo } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field"
import { DrugSearch } from "@/components/medical-records/drug-search"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { type Drug } from "@/hooks/use-drug-search"
import type { PrescriptionFormData } from "@/hooks/use-create-prescriptions"
import { MEDICATION_ROUTES } from "@/types/medical-record"
import { FREQUENCY_OPTIONS } from "@/lib/utils/prescription"

interface PrescriptionFormItemProps {
  index: number
  form: UseFormReturn<PrescriptionFormData>
  drugSearch: string
  onDrugSearchChange: (value: string) => void
  onDrugSelect: (drug: Drug) => void
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

const currentYear = new Date().getFullYear() + 20

export const PrescriptionFormItem = memo(function PrescriptionFormItem({
  index,
  form,
  drugSearch,
  onDrugSearchChange,
  onDrugSelect,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: PrescriptionFormItemProps) {
  const isRecurring = form.watch(`prescriptions.${index}.isRecurring`)

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Resep #{index + 1}</h4>
          {showRemoveButton && onRemove && (
            <Button
              type="button"
              variant="outline"
              className="border-destructive text-destructive"
              size="sm"
              onClick={onRemove}
            >
              <X className="mr-1 h-4 w-4" />
              Hapus
            </Button>
          )}
        </div>
      )}

      <FieldGroup>
        {/* Drug Search */}
        <Field>
          <Controller
            control={form.control}
            name={`prescriptions.${index}.drugId`}
            render={({ fieldState }) => (
              <>
                <DrugSearch
                  value={drugSearch}
                  onChange={onDrugSearchChange}
                  onSelect={onDrugSelect}
                  required
                />
                {fieldState.error?.message && <FieldError>{fieldState.error?.message}</FieldError>}
              </>
            )}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Price Display (Read-only) */}
          <Field>
            <FieldLabel htmlFor={`drugPrice-${index}`}>Harga Satuan</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.drugPrice`}
              render={({ field }) => (
                <Input
                  id={`drugPrice-${index}`}
                  value={`Rp ${parseFloat(field.value || "0").toLocaleString("id-ID")}`}
                  placeholder="Otomatis terisi dari pilihan obat"
                  className="bg-muted font-medium"
                  readOnly
                />
              )}
            />
          </Field>

          {/* Dosage */}
          <Field>
            <FieldLabel htmlFor={`dosage-${index}`}>Dosis</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.dosage`}
              render={({ field, fieldState }) => (
                <>
                  <Input id={`dosage-${index}`} placeholder="Contoh: 500mg, 1 tablet" {...field} />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Frequency */}
          <Field>
            <FieldLabel htmlFor={`frequency-${index}`}>
              Frekuensi <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.frequency`}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih frekuensi" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((freq) => (
                        <SelectItem key={freq.value} value={freq.label}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Quantity */}
          <Field>
            <FieldLabel htmlFor={`quantity-${index}`}>
              Jumlah <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.quantity`}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Route */}
          <Field>
            <FieldLabel htmlFor={`route-${index}`}>Rute Pemberian</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.route`}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICATION_ROUTES.map((route) => (
                        <SelectItem key={route.value} value={route.value}>
                          {route.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`recurring-${index}`}>Obat Rutin (Recurring)</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.isRecurring`}
              render={({ field }) => (
                <span>
                  <Switch
                    checked={field.value}
                    id={`recurring-${index}`}
                    onCheckedChange={(checked) => field.onChange(checked as boolean)}
                  />
                </span>
              )}
            />
          </Field>

          {/* Recurring Fields */}
          {isRecurring && (
            <>
              <Field>
                <FieldContent>
                  <Controller
                    control={form.control}
                    name={`prescriptions.${index}.startDate`}
                    render={({ field, fieldState }) => (
                      <>
                        <DatePickerField
                          label="Tanggal Mulai"
                          value={field.value}
                          onChange={field.onChange}
                          endMonth={new Date(currentYear, 12)}
                        />
                        {fieldState.error?.message && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <Controller
                    control={form.control}
                    name={`prescriptions.${index}.endDate`}
                    render={({ field, fieldState }) => (
                      <>
                        <DatePickerField
                          label="Tanggal Selesai"
                          value={field.value}
                          onChange={field.onChange}
                          endMonth={new Date(currentYear, 12)}
                        />
                        {fieldState.error?.message && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Jadwal Pemberian</FieldLabel>
                <Controller
                  control={form.control}
                  name={`prescriptions.${index}.administrationSchedule`}
                  render={({ field, fieldState }) => (
                    <>
                      <Input placeholder="Contoh: 08:00,14:00,20:00 untuk 3x sehari" {...field} />
                      {fieldState.error?.message && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </>
                  )}
                />
                <FieldDescription>
                  Format: HH:MM,HH:MM,HH:MM (pisahkan dengan koma)
                </FieldDescription>
              </Field>
            </>
          )}
        </div>
        {/* Instructions */}
        <Field>
          <FieldLabel htmlFor={`instructions-${index}`}>Instruksi Tambahan</FieldLabel>
          <Controller
            control={form.control}
            name={`prescriptions.${index}.instructions`}
            render={({ field }) => (
              <Textarea
                id={`instructions-${index}`}
                {...field}
                placeholder="Contoh: Diminum setelah makan"
                rows={2}
              />
            )}
          />
        </Field>
      </FieldGroup>
    </div>
  )
})
