/**
 * Patient Contact Step Component
 * Step 2: Contact information and insurance details
 */

import { Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form"

import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { type PatientFormData } from "@/lib/validations/registration"
import { INSURANCE_TYPES } from "@/types/registration"

interface PatientContactStepProps {
  register: UseFormRegister<PatientFormData>
  control: Control<PatientFormData>
  errors: FieldErrors<PatientFormData>
  insuranceType?: string
}

export function PatientContactStep({
  register,
  control,
  errors,
  insuranceType,
}: PatientContactStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontak & Jaminan</CardTitle>
        <CardDescription>Informasi kontak dan data jaminan kesehatan (opsional).</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Phone */}
            <Field className="gap-2">
              <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
              <Input
                id="phone"
                inputMode="numeric"
                {...register("phone")}
                placeholder="081234567890"
                onKeyUp={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  e.target.value = value
                  register("phone").onChange(e)
                }}
              />
            </Field>

            {/* Email */}
            <Field className="gap-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </FieldGroup>

          {/* Address */}
          <FieldGroup>
            <Field className="gap-2">
              <FieldLabel htmlFor="address">Alamat</FieldLabel>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Emergency Contact */}
            <Field className="gap-2">
              <FieldLabel htmlFor="emergencyContact">Wali/Penanggung Jawab</FieldLabel>
              <Input
                id="emergencyContact"
                {...register("emergencyContact")}
                placeholder="Nama wali/penanggung jawab"
              />
            </Field>

            {/* Emergency Phone */}
            <Field className="gap-2">
              <FieldLabel htmlFor="emergencyPhone">No. Telp Wali/Penanggung Jawab</FieldLabel>
              <Input
                id="emergencyPhone"
                {...register("emergencyPhone")}
                placeholder="081234567890"
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  e.target.value = value
                  register("emergencyPhone").onChange(e)
                }}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Insurance Type */}
            <Field className="gap-2">
              <FieldLabel htmlFor="insuranceType">Jenis Jaminan</FieldLabel>
              <Controller
                name="insuranceType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis jaminan" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Insurance Number */}
            <Field className="gap-2">
              <FieldLabel htmlFor="insuranceNumber">
                Nomor Jaminan
                {insuranceType && insuranceType !== "Umum" && (
                  <span className="text-destructive"> *</span>
                )}
              </FieldLabel>
              <Input
                id="insuranceNumber"
                {...register("insuranceNumber")}
                placeholder="Nomor kartu BPJS/asuransi"
                className={errors.insuranceNumber ? "border-destructive" : ""}
              />
              {errors.insuranceNumber && <FieldError>{errors.insuranceNumber.message}</FieldError>}
            </Field>
          </FieldGroup>

          {/* Allergies */}
          <FieldGroup>
            <Field className="gap-2">
              <FieldLabel htmlFor="allergies">Alergi</FieldLabel>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="Sebutkan alergi obat atau makanan (jika ada)"
                rows={2}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}
