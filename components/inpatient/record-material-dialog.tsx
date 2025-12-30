/**
 * Record Material Usage Dialog Component
 * Form for recording medical material/supplies usage
 * Refactored for better modularity and performance
 */

"use client"

import { useState, useEffect } from "react"
import { IconPackage, IconPlus } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
    totalPrice,
    handleMaterialSelect,
    handleSubmit,
    resetForm,
    serviceSearch,
    setServiceSearch,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Catat Material
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackage className="h-5 w-5" />
            Catat Penggunaan Material
          </DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* Material Search */}
            <MaterialSearchField
              form={form}
              value={serviceSearch}
              onChange={(value) => {
                setServiceSearch(value)
                form.setValue("materialName", value)
              }}
              onMaterialSelect={handleMaterialSelect}
            />

            {/* Quantity & Unit */}
            <QuantityUnitFields form={form} />

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
      </DialogContent>
    </Dialog>
  )
}
