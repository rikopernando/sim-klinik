/**
 * Procedure Item Component
 * Form fields for a single procedure
 */

import { UseFormReturn } from "react-hook-form"
import { X, Loader2 } from "lucide-react"

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
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { type Service } from "@/hooks/use-service-search"
import { type MedicalStaff, formatMedicalStaffName } from "@/lib/services/medical-staff.service"
import { ProcedureFormBulkData } from "@/lib/validations/medical-record"

import { ServiceSearch } from "./service-search"

interface ProcedureItemProps {
  index: number
  form: UseFormReturn<ProcedureFormBulkData>
  serviceSearch: string
  onServiceSearchChange: (value: string) => void
  onServiceSelect: (service: Service) => void
  medicalStaff: MedicalStaff[]
  loadingStaff: boolean
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

export function ProcedureItem({
  index,
  form,
  serviceSearch,
  onServiceSearchChange,
  onServiceSelect,
  medicalStaff,
  loadingStaff,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: ProcedureItemProps) {
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
        <ServiceSearch
          value={serviceSearch}
          onChange={onServiceSearchChange}
          onSelect={onServiceSelect}
          label="Nama Tindakan"
          placeholder="Ketik untuk mencari tindakan medis..."
          required
        />
        <FieldError>{form.formState.errors.procedures?.[index]?.serviceName?.message}</FieldError>
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price (Auto-filled, Read-only) */}
        <Field>
          <FieldLabel htmlFor={`servicePrice-${index}`}>Harga Tindakan</FieldLabel>
          <Input
            id={`servicePrice-${index}`}
            value={
              form.watch(`procedures.${index}.servicePrice`)
                ? `Rp ${parseFloat(form.watch(`procedures.${index}.servicePrice`) || "0").toLocaleString("id-ID")}`
                : "Rp -"
            }
            placeholder="Otomatis terisi dari pilihan tindakan"
            className="bg-muted font-medium"
            readOnly
          />
          <FieldDescription>Harga otomatis terisi saat memilih tindakan</FieldDescription>
        </Field>

        {/* Performed By */}
        <Field>
          <FieldLabel htmlFor={`performedBy-${index}`}>
            Dilakukan Oleh <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.watch(`procedures.${index}.performedBy`)}
            onValueChange={(value) => form.setValue(`procedures.${index}.performedBy`, value)}
            disabled={loadingStaff}
          >
            <SelectTrigger className="w-full" id={`performedBy-${index}`}>
              {loadingStaff ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memuat...</span>
                </div>
              ) : (
                <SelectValue placeholder="Pilih dokter/perawat" />
              )}
            </SelectTrigger>
            <SelectContent>
              {medicalStaff.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {formatMedicalStaffName(staff)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{form.formState.errors.procedures?.[index]?.performedBy?.message}</FieldError>
        </Field>
      </div>

      {/* Description (Auto-filled but editable) */}
      <Field>
        <FieldLabel htmlFor={`description-${index}`}>
          Deskripsi Tindakan <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id={`description-${index}`}
          {...form.register(`procedures.${index}.description`)}
          placeholder="Otomatis terisi dari pilihan tindakan (dapat diedit)"
        />
        <FieldError>{form.formState.errors.procedures?.[index]?.description?.message}</FieldError>
        <FieldDescription>
          Deskripsi otomatis terisi, dapat diubah sesuai kebutuhan
        </FieldDescription>
      </Field>

      {/* Notes */}
      <Field>
        <FieldLabel htmlFor={`notes-${index}`}>Catatan</FieldLabel>
        <Textarea
          id={`notes-${index}`}
          {...form.register(`procedures.${index}.notes`)}
          placeholder="Catatan tambahan mengenai tindakan"
          rows={2}
        />
      </Field>
    </div>
  )
}
