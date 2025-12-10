/**
 * Diagnosis Item Component
 * Form fields for a single diagnosis
 */

import { UseFormReturn } from "react-hook-form"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ICD10Search } from "./icd10-search"
import { DIAGNOSIS_TYPES } from "@/types/medical-record"
import { CreateDiagnosisBulkFormData } from "@/lib/validations/medical-record"

interface DiagnosisItemProps {
  index: number
  form: UseFormReturn<CreateDiagnosisBulkFormData>
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

export function DiagnosisItem({
  index,
  form,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: DiagnosisItemProps) {
  return (
    <div className="space-y-4">
      {/* Item Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Diagnosis #{index + 1}</h4>
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

      {/* ICD-10 Code Search */}
      <Field>
        <ICD10Search
          value={form.watch(`diagnoses.${index}.icd10Code`) || ""}
          onChange={(value) => {
            form.setValue(`diagnoses.${index}.icd10Code`, value)
          }}
          onSelect={(code, description) => {
            form.setValue(`diagnoses.${index}.icd10Code`, code)
            form.setValue(`diagnoses.${index}.description`, description)
          }}
          label="ICD-10"
          placeholder="Ketik kode atau nama penyakit..."
          required
        />
        <FieldError>{form.formState.errors.diagnoses?.[index]?.icd10Code?.message}</FieldError>
      </Field>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor={`description-${index}`}>
          Deskripsi Diagnosis <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id={`description-${index}`}
          {...form.register(`diagnoses.${index}.description`)}
          placeholder="Contoh: Acute nasopharyngitis (Common cold)"
        />
        <FieldError>{form.formState.errors.diagnoses?.[index]?.description?.message}</FieldError>
      </Field>

      {/* Diagnosis Type */}
      <Field>
        <FieldLabel htmlFor={`diagnosisType-${index}`}>Jenis Diagnosis</FieldLabel>
        <Select
          value={form.watch(`diagnoses.${index}.diagnosisType`)}
          onValueChange={(value: "primary" | "secondary") =>
            form.setValue(`diagnoses.${index}.diagnosisType`, value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIAGNOSIS_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
