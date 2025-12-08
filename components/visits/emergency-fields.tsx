/**
 * Emergency Fields Component
 * Form fields specific to emergency visits (Chief Complaint and Triage Status)
 */

import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { type VisitFormData } from "@/lib/validations/registration"
import { TRIAGE_STATUS } from "@/types/registration"

interface EmergencyFieldsProps {
  register: UseFormRegister<VisitFormData>
  errors: FieldErrors<VisitFormData>
  setValue: UseFormSetValue<VisitFormData>
}

export function EmergencyFields({ register, errors, setValue }: EmergencyFieldsProps) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Chief Complaint */}
      <Field className="gap-2 md:col-span-2">
        <FieldLabel htmlFor="chiefComplaint">
          Keluhan Utama <span className="text-destructive">*</span>
        </FieldLabel>
        <Textarea
          id="chiefComplaint"
          {...register("chiefComplaint")}
          placeholder="Jelaskan keluhan atau gejala yang dialami"
          rows={3}
          className={errors.chiefComplaint ? "border-destructive" : ""}
        />
        {errors.chiefComplaint && <FieldError>{errors.chiefComplaint.message}</FieldError>}
      </Field>

      {/* Triage Status */}
      <Field className="gap-2">
        <FieldLabel htmlFor="triageStatus">Status Triage</FieldLabel>
        <Select
          onValueChange={(value) => setValue("triageStatus", value as "red" | "yellow" | "green")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih tingkat kegawatan" />
          </SelectTrigger>
          <SelectContent>
            {TRIAGE_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <span className="flex items-center gap-2">
                  <Badge className={status.color}>{status.label}</Badge>
                  {status.description}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}
