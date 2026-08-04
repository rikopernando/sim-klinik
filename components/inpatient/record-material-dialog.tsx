/**
 * Record Material Usage Dialog Component
 * Form for recording medical material/supplies usage
 * Refactored for better modularity and performance
 */

"use client"

import { useState, useEffect } from "react"
import { IconPackage, IconPlus } from "@tabler/icons-react"

import { DialogFooter } from "@/components/ui/dialog"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog"
import { Button } from "@/components/ui/button"
import { useMaterialForm } from "@/hooks/use-material-form"
import { FieldGroup } from "@/components/ui/field"
import {
  MaterialSearchField,
  QuantityUnitFields,
  PriceFields,
  NotesField,
} from "./material-form-fields"

interface RecordMaterialDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function RecordMaterialDialog({
  visitId,
  patientName,
  onSuccess,
}: RecordMaterialDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    form,
    values,
    totalPrice,
    handleMaterialSelect,
    handleSubmit,
    resetForm,
    materialSearch,
    setMaterialSearch,
  } = useMaterialForm({
    visitId,
    onSuccess,
    onClose: () => setOpen(false),
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Catat Material
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <IconPackage className="h-5 w-5" />
            Catat Penggunaan Material
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Pasien: <strong>{patientName}</strong>
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* Material Search */}
            <MaterialSearchField
              form={form}
              value={materialSearch}
              onChange={(value) => {
                setMaterialSearch(value)
                form.setValue("materialName", value)
              }}
              onMaterialSelect={handleMaterialSelect}
            />

            {/* Quantity & Unit */}
            <QuantityUnitFields form={form} values={values} />

            {/* Prices */}
            <PriceFields form={form} totalPrice={totalPrice} />

            {/* Notes */}
            <NotesField form={form} />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={form.formState.isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Material"}
            </Button>
          </DialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
