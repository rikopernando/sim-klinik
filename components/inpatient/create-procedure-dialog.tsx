/**
 * Create Procedure Dialog Component
 * Bulk creation of procedures for inpatient care
 * Refactored for better modularity and performance
 */

"use client"

import { useEffect, useState } from "react"
import { IconStethoscope, IconPlus, IconDeviceFloppy } from "@tabler/icons-react"

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
import { useCreateProcedures } from "@/hooks/use-create-procedures"
import { Separator } from "@/components/ui/separator"

import { ProcedureFormItem } from "./procedure-form-item"

interface CreateProcedureDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function CreateProcedureDialog({
  visitId,
  patientName,
  onSuccess,
}: CreateProcedureDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditMode = false

  const {
    form,
    fields,
    serviceSearches,
    setServiceSearches,
    addProcedure,
    removeProcedure,
    handleServiceSelect,
    handleSubmit,
    isSubmitting,
  } = useCreateProcedures({
    visitId,
    onSuccess,
    onClose: () => setOpen(false),
  })

  useEffect(() => {
    if (open) {
      addProcedure()
    }
  }, [addProcedure, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconStethoscope className="mr-2 h-4 w-4" />
          Tambah Tindakan
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[100vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconStethoscope className="h-5 w-5" />
            Tambah Tindakan Medis
          </DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong> • {fields.length} tindakan dalam daftar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Error Message */}
          {form.formState.errors.procedures?.root && (
            <div className="text-destructive text-sm">
              {form.formState.errors.procedures.root.message}
            </div>
          )}

          {/* Procedure Items */}
          {fields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <Separator className="my-4" />}
              <ProcedureFormItem
                key={field.id}
                index={index}
                form={form}
                showHeader={!isEditMode}
                serviceSearch={serviceSearches[index] || ""}
                onServiceSelect={(service) => handleServiceSelect(service, index)}
                showRemoveButton={!isEditMode && fields.length > 1}
                onRemove={() => removeProcedure(index)}
                onServiceSearchChange={(value) => {
                  setServiceSearches((prev) => ({ ...prev, [index]: value }))
                  form.setValue(`procedures.${index}.serviceName`, value)
                }}
              />
            </div>
          ))}

          {/* Add Button */}
          <Button type="button" variant="outline" onClick={addProcedure}>
            <IconPlus className="mr-2 h-4 w-4" />
            Tambah Tindakan Lain
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
              {isSubmitting ? "Menyimpan..." : `Simpan ${fields.length} Tindakan`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
