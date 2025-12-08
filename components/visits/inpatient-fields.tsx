/**
 * Inpatient Fields Component
 * Form fields specific to inpatient visits (Room selection)
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

interface InpatientFieldsProps {
  errors: FieldErrors<VisitFormData>
  setValue: UseFormSetValue<VisitFormData>
}

// TODO: Replace with dynamic room data from API
const AVAILABLE_ROOMS = [
  { id: "1", name: "Kamar VIP 101" },
  { id: "2", name: "Kamar Kelas 1 - 201" },
  { id: "3", name: "Kamar Kelas 2 - 301" },
] as const

export function InpatientFields({ errors, setValue }: InpatientFieldsProps) {
  return (
    <FieldGroup>
      <Field className="gap-2">
        <FieldLabel htmlFor="roomId">
          Kamar <span className="text-destructive">*</span>
        </FieldLabel>
        <Select onValueChange={(value) => setValue("roomId", value)}>
          <SelectTrigger className={errors.roomId ? "border-destructive w-full" : "w-full"}>
            <SelectValue placeholder="Pilih kamar" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ROOMS.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roomId && <FieldError>{errors.roomId.message}</FieldError>}
      </Field>
    </FieldGroup>
  )
}
