/**
 * Prescription Form Item Component
 * Single prescription item in the array (memoized for performance)
 * Supports both regular drugs and compound recipes (obat racik)
 */

"use client"

import { memo, useState } from "react"
import { Controller, UseFormReturn, FieldValues } from "react-hook-form"
import { X, Beaker, Pill, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field"
import { DrugSearch } from "@/components/medical-records/drug-search"
import { CompoundRecipeSearch } from "@/components/medical-records/compound-recipe-search"
import { CreateCompoundRecipeDialog } from "@/components/compound-recipes/create-compound-recipe-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { type Drug } from "@/hooks/use-drug-search"
import type { PrescriptionFormData } from "@/hooks/use-create-prescriptions"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"
import { MEDICATION_ROUTES } from "@/types/medical-record"
import { FREQUENCY_OPTIONS } from "@/lib/utils/prescription"

interface PrescriptionFormItemProps {
  index: number
  // Use generic UseFormReturn to avoid type inference issues with Zod refine
  form: UseFormReturn<PrescriptionFormData, unknown, FieldValues>
  drugSearch: string
  onDrugSearchChange: (value: string) => void
  onDrugSelect: (drug: Drug) => void
  onCompoundSelect: (recipe: CompoundRecipeWithCreator) => void
  showHeader?: boolean
  showRemoveButton?: boolean
  onRemove?: () => void
}

const currentYear = new Date().getFullYear() + 20

export const PrescriptionFormItem = memo(function PrescriptionFormItem({
  index,
  form,
  drugSearch,
  onDrugSearchChange,
  onDrugSelect,
  onCompoundSelect,
  showHeader = false,
  showRemoveButton = false,
  onRemove,
}: PrescriptionFormItemProps) {
  const isRecurring = form.watch(`prescriptions.${index}.isRecurring`)
  const isCompound = form.watch(`prescriptions.${index}.isCompound`)
  const [compoundSearch, setCompoundSearch] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Handler for medication type toggle
  const handleToggle = (value: string) => {
    if (!value) return
    const newIsCompound = value === "compound"

    // Clear search states
    setCompoundSearch("")
    onDrugSearchChange("")

    // Clear both drug and compound fields when switching
    form.setValue(`prescriptions.${index}.isCompound`, newIsCompound, { shouldValidate: true })
    form.setValue(`prescriptions.${index}.drugId`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.drugName`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.drugPrice`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.compoundRecipeId`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.compoundRecipeName`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.compoundRecipeCode`, "", { shouldValidate: true })
    form.setValue(`prescriptions.${index}.compoundRecipePrice`, "", { shouldValidate: true })
  }

  // Handle when a new compound recipe is created via the shortcut button
  const handleRecipeCreated = (recipe: CompoundRecipeWithCreator) => {
    onCompoundSelect(recipe)
  }

  // Get display price based on medication type
  const displayPrice = isCompound
    ? form.watch(`prescriptions.${index}.compoundRecipePrice`) || "0"
    : form.watch(`prescriptions.${index}.drugPrice`) || "0"

  // Get selected recipe name for display
  const selectedRecipeName = form.watch(`prescriptions.${index}.compoundRecipeName`)

  return (
    <div className="space-y-4">
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

      <FieldGroup>
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

        {/* Drug Search or Compound Recipe Search */}
        <Field>
          {isCompound ? (
            <Controller
              control={form.control}
              name={`prescriptions.${index}.compoundRecipeId`}
              render={({ fieldState }) => (
                <>
                  <CompoundRecipeSearch
                    value={compoundSearch}
                    onChange={setCompoundSearch}
                    onSelect={onCompoundSelect}
                    required
                  />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          ) : (
            <Controller
              control={form.control}
              name={`prescriptions.${index}.drugId`}
              render={({ fieldState }) => (
                <>
                  <DrugSearch
                    value={drugSearch}
                    onChange={onDrugSearchChange}
                    onSelect={onDrugSelect}
                    required
                  />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
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
              value={`Rp ${parseFloat(displayPrice).toLocaleString("id-ID")}`}
              placeholder={
                isCompound
                  ? "Otomatis terisi dari pilihan obat racik"
                  : "Otomatis terisi dari pilihan obat"
              }
              className="bg-muted font-medium"
              readOnly
            />
          </Field>

          {/* Dosage */}
          <Field>
            <FieldLabel htmlFor={`dosage-${index}`}>Dosis</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.dosage`}
              render={({ field, fieldState }) => (
                <>
                  <Input id={`dosage-${index}`} placeholder="Contoh: 500mg, 1 tablet" {...field} />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Frequency */}
          <Field>
            <FieldLabel htmlFor={`frequency-${index}`}>
              Frekuensi <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.frequency`}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
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
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Quantity */}
          <Field>
            <FieldLabel htmlFor={`quantity-${index}`}>
              Jumlah <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.quantity`}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          {/* Route */}
          <Field>
            <FieldLabel htmlFor={`route-${index}`}>Rute Pemberian</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.route`}
              render={({ field, fieldState }) => (
                <>
                  <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICATION_ROUTES.filter((route) => route.value !== "compounded").map(
                        (route) => (
                          <SelectItem key={route.value} value={route.value}>
                            {route.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`recurring-${index}`}>Obat Rutin (Recurring)</FieldLabel>
            <Controller
              control={form.control}
              name={`prescriptions.${index}.isRecurring`}
              render={({ field }) => (
                <span>
                  <Switch
                    checked={field.value}
                    id={`recurring-${index}`}
                    onCheckedChange={(checked) => field.onChange(checked as boolean)}
                  />
                </span>
              )}
            />
          </Field>

          {/* Recurring Fields */}
          {isRecurring && (
            <>
              <Field>
                <FieldContent>
                  <Controller
                    control={form.control}
                    name={`prescriptions.${index}.startDate`}
                    render={({ field, fieldState }) => (
                      <>
                        <DatePickerField
                          label="Tanggal Mulai"
                          value={field.value}
                          onChange={field.onChange}
                          endMonth={new Date(currentYear, 12)}
                        />
                        {fieldState.error?.message && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <Controller
                    control={form.control}
                    name={`prescriptions.${index}.endDate`}
                    render={({ field, fieldState }) => (
                      <>
                        <DatePickerField
                          label="Tanggal Selesai"
                          value={field.value}
                          onChange={field.onChange}
                          endMonth={new Date(currentYear, 12)}
                        />
                        {fieldState.error?.message && (
                          <FieldError>{fieldState.error?.message}</FieldError>
                        )}
                      </>
                    )}
                  />
                </FieldContent>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Jadwal Pemberian</FieldLabel>
                <Controller
                  control={form.control}
                  name={`prescriptions.${index}.administrationSchedule`}
                  render={({ field, fieldState }) => (
                    <>
                      <Input placeholder="Contoh: 08:00,14:00,20:00 untuk 3x sehari" {...field} />
                      {fieldState.error?.message && (
                        <FieldError>{fieldState.error?.message}</FieldError>
                      )}
                    </>
                  )}
                />
                <FieldDescription>
                  Format: HH:MM,HH:MM,HH:MM (pisahkan dengan koma)
                </FieldDescription>
              </Field>
            </>
          )}
        </div>
        {/* Instructions */}
        <Field>
          <FieldLabel htmlFor={`instructions-${index}`}>Instruksi Tambahan</FieldLabel>
          <Controller
            control={form.control}
            name={`prescriptions.${index}.instructions`}
            render={({ field }) => (
              <Textarea
                id={`instructions-${index}`}
                {...field}
                placeholder="Contoh: Diminum setelah makan"
                rows={2}
              />
            )}
          />
        </Field>
      </FieldGroup>

      {/* Create Compound Recipe Dialog (Shortcut) */}
      <CreateCompoundRecipeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleRecipeCreated}
      />
    </div>
  )
})
