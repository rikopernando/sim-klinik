/**
 * Fulfillment Form Fields Component
 * Common fields for pharmacist selection and notes
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Pharmacist } from "@/types/user"

interface FulfillmentFormFieldsProps {
  fulfilledBy: string
  notes: string
  pharmacists: Pharmacist[]
  isLoadingPharmacists: boolean
  onFulfilledByChange: (value: string) => void
  onNotesChange: (value: string) => void
}

export function FulfillmentFormFields({
  fulfilledBy,
  notes,
  pharmacists,
  isLoadingPharmacists,
  onFulfilledByChange,
  onNotesChange,
}: FulfillmentFormFieldsProps) {
  return (
    <FieldSet>
      <FieldGroup>
        <Field className="gap-2">
          <FieldLabel htmlFor="fulfilledBy">
            Petugas Farmasi <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={fulfilledBy}
            onValueChange={onFulfilledByChange}
            disabled={isLoadingPharmacists}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isLoadingPharmacists
                    ? "Memuat farmasi..."
                    : pharmacists.length === 0
                      ? "Tidak ada farmasi tersedia"
                      : "Pilih petugas farmasi"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {pharmacists.map((pharmacist) => (
                <SelectItem key={pharmacist.id} value={pharmacist.id}>
                  {pharmacist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="notes">Catatan</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Catatan tambahan untuk semua resep..."
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}
