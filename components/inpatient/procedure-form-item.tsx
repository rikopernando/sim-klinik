/**
 * Procedure Form Item Component
 * Single procedure item in the array (memoized for performance)
 */

"use client"

import { memo } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { X } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { ServiceSearch } from "@/components/medical-records/service-search"
import { type Service } from "@/hooks/use-service-search"
import type { ProcedureFormData } from "@/hooks/use-create-procedures"
import { TIME_OPTIONS } from "@/lib/constants/inpatient"

interface ProcedureFormItemProps {
  index: number
  form: UseFormReturn<ProcedureFormData>
  serviceSearch: string
  onServiceSearchChange: (value: string) => void
  onServiceSelect: (service: Service) => void
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

const currentYear = new Date().getFullYear() + 20

export const ProcedureFormItem = memo(function ProcedureFormItem({
  index,
  form,
  serviceSearch,
  onServiceSearchChange,
  onServiceSelect,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: ProcedureFormItemProps) {
  return (
    <div className="space-y-4">
      {/* Item Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Tindakan #{index + 1}</h4>
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

      {/* Service Search */}
      <Field>
        <Controller
          control={form.control}
          name={`procedures.${index}.serviceName`}
          render={({ fieldState }) => (
            <>
              <ServiceSearch
                required
                value={serviceSearch}
                onChange={onServiceSearchChange}
                onSelect={onServiceSelect}
                label="Nama Tindakan"
                placeholder="Ketik untuk mencari tindakan medis..."
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </>
          )}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price (Auto-filled, Read-only) */}
        <Field>
          <FieldLabel htmlFor={`servicePrice-${index}`}>Harga Tindakan</FieldLabel>
          <Controller
            control={form.control}
            name={`procedures.${index}.servicePrice`}
            render={({ field }) => (
              <Input
                readOnly
                id={`servicePrice-${index}`}
                className="bg-muted font-medium"
                placeholder="Otomatis terisi dari pilihan tindakan"
                value={
                  field.value
                    ? `Rp ${parseFloat(field.value || "0").toLocaleString("id-ID")}`
                    : "Rp -"
                }
              />
            )}
          />
          <FieldDescription>Harga otomatis terisi saat memilih tindakan</FieldDescription>
        </Field>

        {/* Scheduled At */}
        <Field>
          <FieldLabel>Jadwal Tindakan</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              control={form.control}
              name={`procedures.${index}.scheduledDate`}
              render={({ field }) => (
                <DatePickerField
                  value={field.value}
                  onChange={field.onChange}
                  endMonth={new Date(currentYear, 12)}
                  dateFormat="dd/MM/yyyy"
                />
              )}
            />
            <Controller
              control={form.control}
              name={`procedures.${index}.scheduledTime`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.label}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <FieldDescription>Kapan tindakan dijadwalkan untuk dilakukan</FieldDescription>
        </Field>
      </div>

      {/* Description (Auto-filled but editable) */}
      <Field>
        <FieldLabel htmlFor={`description-${index}`}>
          Deskripsi Tindakan <span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          control={form.control}
          name={`procedures.${index}.description`}
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                id={`description-${index}`}
                placeholder="Otomatis terisi dari pilihan tindakan (dapat diedit)"
              />
              {fieldState.error?.message && <FieldError>{fieldState.error.message}</FieldError>}
            </>
          )}
        />
        <FieldDescription>
          Deskripsi otomatis terisi, dapat diubah sesuai kebutuhan
        </FieldDescription>
      </Field>

      {/* Notes */}
      <Field>
        <FieldLabel htmlFor={`notes-${index}`}>Catatan</FieldLabel>
        <Controller
          control={form.control}
          name={`procedures.${index}.notes`}
          render={({ field }) => (
            <Textarea
              rows={2}
              id={`notes-${index}`}
              placeholder="Catatan tambahan mengenai tindakan"
              {...field}
            />
          )}
        />
      </Field>
    </div>
  )
})
