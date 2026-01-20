/**
 * Vital Signs Fields Component
 * Reusable form fields for recording vital signs
 * Extracted from components/inpatient/record-vitals-dialog.tsx
 */

"use client"

import { Control, Controller, FieldErrors } from "react-hook-form"

import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VitalSignsFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>
}

const CONSCIOUSNESS_OPTIONS = [
  { value: "Alert", label: "Alert (Sadar)" },
  { value: "Confused", label: "Confused (Bingung)" },
  { value: "Drowsy", label: "Drowsy (Mengantuk)" },
  { value: "Unresponsive", label: "Unresponsive (Tidak Responsif)" },
]

export function VitalSignsFields({ control, errors }: VitalSignsFieldsProps) {
  return (
    <div className="space-y-4">
      <FieldGroup className="grid grid-cols-2 gap-4">
        {/* Temperature */}
        <Field>
          <FieldLabel htmlFor="temperature">Suhu Tubuh (°C)</FieldLabel>
          <Controller
            control={control}
            name="temperature"
            render={({ field }) => (
              <Input id="temperature" {...field} placeholder="36.5" type="number" />
            )}
          />
          <FieldError errors={[errors.temperature]} />
        </Field>

        {/* Pulse */}
        <Field>
          <FieldLabel htmlFor="pulse">Nadi (per menit)</FieldLabel>
          <Controller
            control={control}
            name="pulse"
            render={({ field }) => (
              <Input
                id="pulse"
                type="number"
                placeholder="80"
                value={field.value ? field.value.toString() : ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            )}
          />
          <FieldError errors={[errors.pulse]} />
        </Field>

        {/* Blood Pressure Systolic */}
        <Field>
          <FieldLabel htmlFor="bloodPressureSystolic">Tekanan Darah Sistolik (mmHg)</FieldLabel>
          <Controller
            control={control}
            name="bloodPressureSystolic"
            render={({ field }) => (
              <Input
                id="bloodPressureSystolic"
                type="number"
                placeholder="120"
                value={field.value ? field.value.toString() : ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            )}
          />
          <FieldError errors={[errors.bloodPressureSystolic]} />
        </Field>

        {/* Blood Pressure Diastolic */}
        <Field>
          <FieldLabel htmlFor="bloodPressureDiastolic">Tekanan Darah Diastolik (mmHg)</FieldLabel>
          <Controller
            control={control}
            name="bloodPressureDiastolic"
            render={({ field }) => (
              <Input
                id="bloodPressureDiastolic"
                type="number"
                placeholder="80"
                value={field.value ? field.value.toString() : ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            )}
          />
          <FieldError errors={[errors.bloodPressureDiastolic]} />
        </Field>

        {/* Respiratory Rate */}
        <Field>
          <FieldLabel htmlFor="respiratoryRate">Laju Respirasi (per menit)</FieldLabel>
          <Controller
            control={control}
            name="respiratoryRate"
            render={({ field }) => (
              <Input
                id="respiratoryRate"
                type="number"
                placeholder="20"
                value={field.value ? field.value.toString() : ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            )}
          />
          <FieldError errors={[errors.respiratoryRate]} />
        </Field>

        {/* Oxygen Saturation */}
        <Field>
          <FieldLabel htmlFor="oxygenSaturation">Saturasi Oksigen (%)</FieldLabel>
          <Controller
            control={control}
            name="oxygenSaturation"
            render={({ field }) => (
              <Input id="oxygenSaturation" {...field} placeholder="98" type="number" />
            )}
          />
          <FieldError errors={[errors.oxygenSaturation]} />
        </Field>

        {/* Weight */}
        <Field>
          <FieldLabel htmlFor="weight">Berat Badan (kg)</FieldLabel>
          <Controller
            control={control}
            name="weight"
            render={({ field }) => <Input id="weight" {...field} placeholder="70" type="number" />}
          />
          <FieldError errors={[errors.weight]} />
        </Field>

        {/* Height */}
        <Field>
          <FieldLabel htmlFor="height">Tinggi Badan (cm)</FieldLabel>
          <Controller
            control={control}
            name="height"
            render={({ field }) => <Input id="height" {...field} placeholder="170" type="number" />}
          />
          <FieldError errors={[errors.height]} />
        </Field>

        {/* Pain Scale */}
        <Field>
          <FieldLabel htmlFor="painScale">Skala Nyeri (0-10)</FieldLabel>
          <Controller
            control={control}
            name="painScale"
            render={({ field }) => (
              <Input
                id="painScale"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={field.value ? field.value.toString() : ""}
                onChange={(e) =>
                  field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            )}
          />
          <FieldError errors={[errors.painScale]} />
        </Field>

        {/* Consciousness */}
        <Field>
          <FieldLabel htmlFor="consciousness">Tingkat Kesadaran</FieldLabel>
          <Controller
            control={control}
            name="consciousness"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="consciousness">
                  <SelectValue placeholder="Pilih tingkat kesadaran" />
                </SelectTrigger>
                <SelectContent>
                  {CONSCIOUSNESS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.consciousness]} />
        </Field>
      </FieldGroup>
    </div>
  )
}
