/**
 * Create Prescription Dialog Component
 * Bulk creation of prescriptions for inpatient care
 * Refactored for better modularity and performance
 */

"use client"

import { useEffect, useState } from "react"
import { IconPill, IconPlus, IconDeviceFloppy } from "@tabler/icons-react"

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
import { useCreatePrescriptions } from "@/hooks/use-create-prescriptions"
import { Separator } from "@/components/ui/separator"

import { PrescriptionFormItem } from "./prescription-form-item"

interface CreatePrescriptionDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function CreatePrescriptionDialog({
  visitId,
  patientName,
  onSuccess,
}: CreatePrescriptionDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    form,
    fields,
    addPrescription,
    removePrescription,
    handleDrugSelect,
    handleSubmit,
    drugSearches,
    isEditMode,
    isSubmitting,
    setDrugSearches,
  } = useCreatePrescriptions({
    visitId,
    onSuccess,
    onClose: () => setOpen(false),
  })

  useEffect(() => {
    if (open) {
      addPrescription()
    }
  }, [addPrescription, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPill className="mr-2 h-4 w-4" />
          Tambah Resep
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPill className="h-5 w-5" />
            Tambah Resep Obat
          </DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong> • {fields.length} resep dalam daftar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Prescription Items */}
          {fields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <Separator className="my-4" />}
              <PrescriptionFormItem
                index={index}
                form={form}
                drugSearch={drugSearches[index] || ""}
                onDrugSearchChange={(value) =>
                  setDrugSearches((prev) => ({ ...prev, [index]: value }))
                }
                onDrugSelect={(drug) => handleDrugSelect(index, drug)}
                showHeader={!isEditMode}
                showRemoveButton={!isEditMode && fields.length > 1}
                onRemove={removePrescription}
              />
            </div>
          ))}

          {/* Error Message */}
          {form.formState.errors.prescriptions?.root && (
            <div className="text-destructive text-sm">
              {form.formState.errors.prescriptions.root.message}
            </div>
          )}

          {/* Add Button */}
          <Button type="button" variant="outline" onClick={addPrescription}>
            <IconPlus className="mr-2 h-4 w-4" />
            Tambah Resep Lain
          </Button>
          {/* Footer Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setOpen(false)
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || fields.length === 0}>
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : `Simpan ${fields.length} Resep`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
