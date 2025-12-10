/**
 * Prescription Item Component
 * Form fields for a single prescription
 */

import { UseFormReturn } from "react-hook-form"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { DrugSearch } from "./drug-search"
import { MEDICATION_ROUTES } from "@/types/medical-record"
import { FREQUENCY_OPTIONS } from "@/lib/utils/prescription"
import { type Drug } from "@/hooks/use-drug-search"
import { PrescriptionFormBulkData } from "@/lib/validations/medical-record"

interface PrescriptionItemProps {
  index: number
  form: UseFormReturn<PrescriptionFormBulkData>
  drugSearch: string
  onDrugSearchChange: (value: string) => void
  onDrugSelect: (drug: Drug) => void
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

export function PrescriptionItem({
  index,
  form,
  drugSearch,
  onDrugSearchChange,
  onDrugSelect,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: PrescriptionItemProps) {
  return (
    <div className="space-y-4">
      {/* Item Header */}
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

      {/* Drug Search */}
      <Field>
        <DrugSearch
          value={drugSearch}
          onChange={onDrugSearchChange}
          onSelect={onDrugSelect}
          required
        />
        <FieldError>{form.formState.errors.prescriptions?.[index]?.drugId?.message}</FieldError>
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price Display (Read-only) */}
        <Field>
          <FieldLabel htmlFor={`drugPrice-${index}`}>Harga Satuan</FieldLabel>
          <Input
            id={`drugPrice-${index}`}
            value={`Rp ${parseFloat(form.watch(`prescriptions.${index}.drugPrice`) || "0").toLocaleString("id-ID")}`}
            placeholder="Otomatis terisi dari pilihan obat"
            className="bg-muted font-medium"
            readOnly
          />
        </Field>

        {/* Dosage */}
        <Field>
          <FieldLabel htmlFor={`dosage-${index}`}>Dosis</FieldLabel>
          <Input
            id={`dosage-${index}`}
            {...form.register(`prescriptions.${index}.dosage`)}
            placeholder="Contoh: 500mg, 1 tablet"
          />
          <FieldError>{form.formState.errors.prescriptions?.[index]?.dosage?.message}</FieldError>
        </Field>

        {/* Frequency */}
        <Field>
          <FieldLabel htmlFor={`frequency-${index}`}>
            Frekuensi <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.watch(`prescriptions.${index}.frequency`)}
            onValueChange={(value) => form.setValue(`prescriptions.${index}.frequency`, value)}
          >
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
          <FieldError>
            {form.formState.errors.prescriptions?.[index]?.frequency?.message}
          </FieldError>
        </Field>

        {/* Quantity */}
        <Field>
          <FieldLabel htmlFor={`quantity-${index}`}>
            Jumlah <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id={`quantity-${index}`}
            type="number"
            min="1"
            {...form.register(`prescriptions.${index}.quantity`, {
              valueAsNumber: true,
            })}
          />
          <FieldError>{form.formState.errors.prescriptions?.[index]?.quantity?.message}</FieldError>
        </Field>

        {/* Route */}
        <Field className="md:col-span-2">
          <FieldLabel htmlFor={`route-${index}`}>Rute Pemberian</FieldLabel>
          <Select
            value={form.watch(`prescriptions.${index}.route`)}
            onValueChange={(value) => form.setValue(`prescriptions.${index}.route`, value)}
          >
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
        </Field>
      </div>

      {/* Instructions */}
      <Field>
        <FieldLabel htmlFor={`instructions-${index}`}>Instruksi Tambahan</FieldLabel>
        <Textarea
          id={`instructions-${index}`}
          {...form.register(`prescriptions.${index}.instructions`)}
          placeholder="Contoh: Diminum setelah makan"
          rows={2}
        />
      </Field>
    </div>
  )
}
