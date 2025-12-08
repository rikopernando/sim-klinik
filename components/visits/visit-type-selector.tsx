/**
 * Visit Type Selector Component
 * Radio card selection for visit type (Outpatient, Inpatient, Emergency)
 */

import { Stethoscope, Bed, AlertCircle } from "lucide-react"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type VisitType = "outpatient" | "inpatient" | "emergency"

interface VisitTypeSelectorProps {
  value: VisitType
  onChange: (value: VisitType) => void
}

const VISIT_TYPES = [
  {
    value: "outpatient" as const,
    label: "Rawat Jalan",
    icon: Stethoscope,
  },
  {
    value: "inpatient" as const,
    label: "Rawat Inap",
    icon: Bed,
  },
  {
    value: "emergency" as const,
    label: "UGD",
    icon: AlertCircle,
  },
] as const

export function VisitTypeSelector({ value, onChange }: VisitTypeSelectorProps) {
  return (
    <FieldGroup>
      <Field className="gap-3">
        <FieldLabel>Jenis Kunjungan</FieldLabel>
        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(val as VisitType)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {VISIT_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <Label
                key={type.value}
                htmlFor={type.value}
                className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
              >
                <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                <Icon className="mb-3 h-6 w-6" />
                <span className="text-center font-medium">{type.label}</span>
              </Label>
            )
          })}
        </RadioGroup>
      </Field>
    </FieldGroup>
  )
}
