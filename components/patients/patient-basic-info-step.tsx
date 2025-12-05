/**
 * Patient Basic Info Step Component
 * Step 1: Basic patient information (Name, NIK, Gender, DOB, Blood Type)
 */

import { Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { type PatientFormData } from "@/lib/validations/registration"
import { BLOOD_TYPES } from "@/types/registration"

interface PatientBasicInfoStepProps {
  register: UseFormRegister<PatientFormData>
  control: Control<PatientFormData>
  errors: FieldErrors<PatientFormData>
}

export function PatientBasicInfoStep({ register, control, errors }: PatientBasicInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Utama Pasien</CardTitle>
        <CardDescription>
          Masukkan informasi dasar pasien. Nama, NIK, dan jenis kelamin wajib diisi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">
                Nama Lengkap <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="name"
                {...register("name")}
                placeholder="Masukkan nama lengkap"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="nik">
                NIK (16 digit) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="nik"
                type="text"
                inputMode="numeric"
                {...register("nik")}
                placeholder="3201234567890123"
                maxLength={16}
                className={errors.nik ? "border-destructive" : ""}
                onKeyUp={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  e.target.value = value
                  register("nik").onChange(e)
                }}
              />
              {errors.nik && <FieldError>{errors.nik.message}</FieldError>}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="gender">
                Jenis Kelamin <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-6"
                  >
                    <Field orientation="horizontal">
                      <RadioGroupItem value="male" id="male" />
                      <FieldLabel htmlFor="male" className="cursor-pointer font-normal">
                        Laki-laki
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="female" id="female" />
                      <FieldLabel htmlFor="female" className="cursor-pointer font-normal">
                        Perempuan
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                )}
              />
              {errors.gender && <FieldError>{errors.gender.message}</FieldError>}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="dateOfBirth">
                Tanggal Lahir <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.dateOfBirth && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal lahir</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.dateOfBirth && <FieldError>{errors.dateOfBirth.message}</FieldError>}
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="bloodType">Golongan Darah</FieldLabel>
              <Controller
                name="bloodType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih golongan darah" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  )
}
