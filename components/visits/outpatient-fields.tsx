/**
 * Outpatient Fields Component
 * Form fields specific to outpatient visits (Poli and Doctor selection)
 */

import { FieldErrors, UseFormSetValue } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type VisitFormData } from "@/lib/validations/registration"
import { Poli } from "@/types/poli"
import { Doctor } from "@/types/user"

interface OutpatientFieldsProps {
  polis: Poli[]
  doctors: Doctor[]
  loadingPolis: boolean
  loadingDoctors: boolean
  errors: FieldErrors<VisitFormData>
  setValue: UseFormSetValue<VisitFormData>
}

export function OutpatientFields({
  polis,
  doctors,
  loadingPolis,
  loadingDoctors,
  errors,
  setValue,
}: OutpatientFieldsProps) {
  return (
    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Poli Selection */}
      <Field className="gap-2">
        <FieldLabel htmlFor="poliId">
          Poli/Poliklinik <span className="text-destructive">*</span>
        </FieldLabel>
        <Select onValueChange={(value) => setValue("poliId", value)} disabled={loadingPolis}>
          <SelectTrigger className={errors.poliId ? "border-destructive w-full" : "w-full"}>
            <SelectValue
              placeholder={
                loadingPolis
                  ? "Memuat poli..."
                  : polis.length === 0
                    ? "Tidak ada poli tersedia"
                    : "Pilih poli tujuan"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {polis.map((poli) => (
              <SelectItem key={poli.id} value={poli.id.toString()}>
                {poli.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.poliId && <FieldError>{errors.poliId.message}</FieldError>}
      </Field>

      {/* Doctor Selection */}
      <Field className="gap-2">
        <FieldLabel htmlFor="doctorId">
          Dokter <span className="text-destructive">*</span>
        </FieldLabel>
        <Select onValueChange={(value) => setValue("doctorId", value)} disabled={loadingDoctors}>
          <SelectTrigger className={errors.doctorId ? "border-destructive w-full" : "w-full"}>
            <SelectValue
              placeholder={
                loadingDoctors
                  ? "Memuat dokter..."
                  : doctors.length === 0
                    ? "Tidak ada dokter tersedia"
                    : "Pilih dokter"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.doctorId && <FieldError>{errors.doctorId.message}</FieldError>}
      </Field>
    </FieldGroup>
  )
}
