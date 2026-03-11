/**
 * Prescription Item Component
 * Form fields for a single prescription (drug or compound recipe)
 */

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { X, Pill, Beaker, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { MEDICATION_ROUTES } from "@/types/medical-record"
import { FREQUENCY_OPTIONS } from "@/lib/utils/prescription"
import { type Drug } from "@/hooks/use-drug-search"
import { PrescriptionFormBulkData } from "@/lib/validations/medical-record"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

import { DrugSearch } from "./drug-search"
import { CompoundRecipeSearch } from "./compound-recipe-search"
import { CreateCompoundRecipeDialog } from "@/components/compound-recipes/create-compound-recipe-dialog"

interface PrescriptionItemProps {
  index: number
  form: UseFormReturn<PrescriptionFormBulkData>
  // Drug search props
  drugSearch: string
  onDrugSearchChange: (value: string) => void
  onDrugSelect: (drug: Drug) => void
  // Compound search props
  compoundSearch: string
  onCompoundSearchChange: (value: string) => void
  onCompoundSelect: (recipe: CompoundRecipeWithCreator) => void
  // UI props
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

export function PrescriptionItem({
  index,
  form,
  drugSearch,
  onDrugSearchChange,
  onDrugSelect,
  compoundSearch,
  onCompoundSearchChange,
  onCompoundSelect,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: PrescriptionItemProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const isCompound = form.watch(`prescriptions.${index}.isCompound`)

  // Handle when a new compound recipe is created via the shortcut button
  const handleRecipeCreated = (recipe: CompoundRecipeWithCreator) => {
    onCompoundSelect(recipe)
  }

  const handleToggle = (value: string) => {
    if (!value) return
    const newIsCompound = value === "compound"
    form.setValue(`prescriptions.${index}.isCompound`, newIsCompound)

    // Clear opposite type fields
    if (newIsCompound) {
      form.setValue(`prescriptions.${index}.drugId`, "")
      form.setValue(`prescriptions.${index}.drugName`, "")
      form.setValue(`prescriptions.${index}.drugPrice`, "")
      onDrugSearchChange("")
    } else {
      form.setValue(`prescriptions.${index}.compoundRecipeId`, "")
      form.setValue(`prescriptions.${index}.compoundRecipeName`, "")
      form.setValue(`prescriptions.${index}.compoundRecipePrice`, "")
      onCompoundSearchChange("")
    }
  }

  const getPrice = () => {
    if (isCompound) {
      const price = form.watch(`prescriptions.${index}.compoundRecipePrice`) || "0"
      return parseFloat(price)
    }
    const price = form.watch(`prescriptions.${index}.drugPrice`) || "0"
    return parseFloat(price)
  }

  // Get selected recipe composition for display
  const selectedRecipeName = form.watch(`prescriptions.${index}.compoundRecipeName`)

  return (
    <div className="space-y-4">
      {/* Item Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Resep #{index + 1}</h4>
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

      {/* Prescription Type Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          type="single"
          value={isCompound ? "compound" : "drug"}
          onValueChange={handleToggle}
          variant="outline"
          size="lg"
        >
          <ToggleGroupItem value="drug" className="gap-1.5">
            <Pill className="h-4 w-4" />
            Obat Biasa
          </ToggleGroupItem>
          <ToggleGroupItem value="compound" className="gap-1.5">
            <Beaker className="h-4 w-4" />
            Obat Racik
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Shortcut to add new compound recipe */}
        {isCompound && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Tambah Obat Racik Baru
          </Button>
        )}
      </div>

      {/* Drug or Compound Search */}
      <Field>
        {isCompound ? (
          <>
            <CompoundRecipeSearch
              value={compoundSearch}
              onChange={onCompoundSearchChange}
              onSelect={onCompoundSelect}
              required
            />
            <FieldError>
              {form.formState.errors.prescriptions?.[index]?.compoundRecipeId?.message}
            </FieldError>
          </>
        ) : (
          <>
            <DrugSearch
              value={drugSearch}
              onChange={onDrugSearchChange}
              onSelect={onDrugSelect}
              required
            />
            <FieldError>{form.formState.errors.prescriptions?.[index]?.drugId?.message}</FieldError>
          </>
        )}
      </Field>

      {/* Selected Compound Recipe Info */}
      {isCompound && selectedRecipeName && (
        <div className="bg-muted/50 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Beaker className="h-3 w-3" />
              Obat Racik
            </Badge>
            <span className="text-sm font-medium">{selectedRecipeName}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Price Display (Read-only) */}
        <Field>
          <FieldLabel htmlFor={`price-${index}`}>Harga Satuan</FieldLabel>
          <Input
            id={`price-${index}`}
            value={`Rp ${getPrice().toLocaleString("id-ID")}`}
            placeholder="Otomatis terisi dari pilihan"
            className="bg-muted font-medium"
            readOnly
          />
        </Field>

        {/* Dosage */}
        <Field>
          <FieldLabel htmlFor={`dosage-${index}`}>Dosis</FieldLabel>
          <Input
            id={`dosage-${index}`}
            {...form.register(`prescriptions.${index}.dosage`)}
            placeholder={isCompound ? "Contoh: 1 bungkus" : "Contoh: 500mg, 1 tablet"}
          />
          <FieldError>{form.formState.errors.prescriptions?.[index]?.dosage?.message}</FieldError>
        </Field>

        {/* Frequency */}
        <Field>
          <FieldLabel htmlFor={`frequency-${index}`}>
            Frekuensi <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={form.watch(`prescriptions.${index}.frequency`)}
            onValueChange={(value) => form.setValue(`prescriptions.${index}.frequency`, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih frekuensi" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((freq) => (
                <SelectItem key={freq.value} value={freq.label}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>
            {form.formState.errors.prescriptions?.[index]?.frequency?.message}
          </FieldError>
        </Field>

        {/* Quantity */}
        <Field>
          <FieldLabel htmlFor={`quantity-${index}`}>
            Jumlah <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id={`quantity-${index}`}
            type="number"
            min="1"
            {...form.register(`prescriptions.${index}.quantity`, {
              valueAsNumber: true,
            })}
          />
          <FieldError>{form.formState.errors.prescriptions?.[index]?.quantity?.message}</FieldError>
        </Field>

        {/* Route */}
        <Field className="md:col-span-2">
          <FieldLabel htmlFor={`route-${index}`}>Rute Pemberian</FieldLabel>
          <Select
            value={form.watch(`prescriptions.${index}.route`)}
            onValueChange={(value) => form.setValue(`prescriptions.${index}.route`, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDICATION_ROUTES.filter((route) => route.value !== "compounded").map((route) => (
                <SelectItem key={route.value} value={route.value}>
                  {route.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Instructions */}
      <Field>
        <FieldLabel htmlFor={`instructions-${index}`}>Instruksi Tambahan</FieldLabel>
        <Textarea
          id={`instructions-${index}`}
          {...form.register(`prescriptions.${index}.instructions`)}
          placeholder="Contoh: Diminum setelah makan"
          rows={2}
        />
      </Field>

      {/* Create Compound Recipe Dialog (Shortcut) */}
      <CreateCompoundRecipeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleRecipeCreated}
      />
    </div>
  )
}
