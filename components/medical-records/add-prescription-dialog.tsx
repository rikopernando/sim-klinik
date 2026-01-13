"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { addPrescription, updatePrescription } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type Prescription } from "@/types/medical-record"
import { type Drug } from "@/hooks/use-drug-search"
import {
  DEFAULT_PRESCRIPTION_ITEM,
  createPrescriptionItem,
  findDuplicatePrescription,
} from "@/lib/utils/prescription"
import {
  PrescriptionFormBulkData,
  prescriptionFormBulkSchema,
} from "@/lib/validations/medical-record"

import { PrescriptionItem } from "./prescription-item"

interface AddPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicalRecordId: string
  onSuccess: () => void
  prescription?: Prescription | null // If provided, it's edit mode
  existingPrescriptions?: Prescription[] // For duplicate checking
}

export function AddPrescriptionDialog({
  open,
  onOpenChange,
  medicalRecordId,
  onSuccess,
  prescription,
  existingPrescriptions = [],
}: AddPrescriptionDialogProps) {
  const { visitId } = useParams<{ visitId: string }>()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drugSearches, setDrugSearches] = useState<Record<number, string>>({})
  const isEditMode = !!prescription

  const form = useForm<PrescriptionFormBulkData>({
    resolver: zodResolver(prescriptionFormBulkSchema),
    defaultValues: {
      prescriptions: [DEFAULT_PRESCRIPTION_ITEM],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  })

  // Reset form when dialog opens or prescription changes
  useEffect(() => {
    if (open) {
      const initialData =
        isEditMode && prescription
          ? {
              prescriptions: [
                {
                  drugId: prescription.drugId,
                  drugName: prescription.drugName,
                  drugPrice: prescription.drugPrice || "",
                  dosage: prescription.dosage || "",
                  frequency: prescription.frequency,
                  quantity: prescription.quantity,
                  instructions: prescription.instructions || "",
                  route: prescription.route || "oral",
                },
              ],
            }
          : { prescriptions: [DEFAULT_PRESCRIPTION_ITEM] }

      form.reset(initialData)
      setDrugSearches(isEditMode && prescription ? { 0: prescription.drugName || "" } : {})
      setError(null)
    }
  }, [open, prescription, isEditMode, form])

  const handleClose = useCallback(() => {
    form.reset()
    setDrugSearches({})
    setError(null)
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleDrugSelect = useCallback(
    (index: number, drug: Drug) => {
      form.setValue(`prescriptions.${index}.drugId`, drug.id)
      form.setValue(`prescriptions.${index}.drugName`, drug.name)
      form.setValue(`prescriptions.${index}.drugPrice`, drug.price)
      setDrugSearches((prev) => ({ ...prev, [index]: drug.name }))
    },
    [form]
  )

  const handleAddItem = useCallback(() => {
    append(createPrescriptionItem())
  }, [append])

  const handleRemoveItem = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
        setDrugSearches((prev) => {
          const newSearches = { ...prev }
          delete newSearches[index]
          return newSearches
        })
      }
    },
    [fields.length, remove]
  )

  const onSubmit = useCallback(
    async (data: PrescriptionFormBulkData) => {
      try {
        setIsSaving(true)
        setError(null)

        if (isEditMode && prescription) {
          // Edit mode: Check for duplicate (excluding current prescription)
          const duplicate = findDuplicatePrescription(
            data.prescriptions[0].drugId,
            existingPrescriptions,
            prescription.id
          )

          if (duplicate) {
            setError(
              `Resep untuk obat "${data.prescriptions[0].drugName}" sudah ada dalam rekam medis ini`
            )
            return
          }

          await updatePrescription(prescription.id, {
            medicalRecordId,
            visitId,
            drugId: data.prescriptions[0].drugId,
            dosage: data.prescriptions[0].dosage || undefined,
            frequency: data.prescriptions[0].frequency,
            quantity: data.prescriptions[0].quantity,
            instructions: data.prescriptions[0].instructions || undefined,
            route: data.prescriptions[0].route || undefined,
          })

          toast.success("Resep berhasil diupdate!")
        } else {
          // Add mode: Check for duplicates
          for (const prescriptionItem of data.prescriptions) {
            const duplicate = findDuplicatePrescription(
              prescriptionItem.drugId,
              existingPrescriptions
            )

            if (duplicate) {
              setError(
                `Resep untuk obat "${prescriptionItem.drugName}" sudah ada dalam rekam medis ini`
              )
              return
            }
          }

          // Save all prescriptions sequentially
          for (const prescriptionItem of data.prescriptions) {
            await addPrescription({
              medicalRecordId,
              visitId,
              drugId: prescriptionItem.drugId,
              dosage: prescriptionItem.dosage || undefined,
              frequency: prescriptionItem.frequency,
              quantity: prescriptionItem.quantity,
              instructions: prescriptionItem.instructions || undefined,
              route: prescriptionItem.route || undefined,
            })
          }

          toast.success(`${data.prescriptions.length} resep berhasil ditambahkan!`)
        }

        handleClose()
        onSuccess()
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        toast.error("Gagal menyimpan resep")
      } finally {
        setIsSaving(false)
      }
    },
    [
      isEditMode,
      prescription,
      handleClose,
      onSuccess,
      existingPrescriptions,
      medicalRecordId,
      visitId,
    ]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Resep" : "Tambah Resep"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Perbarui resep obat untuk pasien"
                : "Tambahkan satu atau lebih resep obat untuk pasien"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* Prescription Items */}
            {fields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <Separator className="my-4" />}
                <PrescriptionItem
                  index={index}
                  form={form}
                  drugSearch={drugSearches[index] || ""}
                  onDrugSearchChange={(value) =>
                    setDrugSearches((prev) => ({ ...prev, [index]: value }))
                  }
                  onDrugSelect={(drug) => handleDrugSelect(index, drug)}
                  showHeader={!isEditMode}
                  showRemoveButton={!isEditMode && fields.length > 1}
                  onRemove={() => handleRemoveItem(index)}
                />
              </div>
            ))}

            {/* Add More Button (only in add mode) */}
            {!isEditMode && (
              <Button type="button" variant="outline" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Resep Lain
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Menyimpan..." : `Menyimpan ${fields.length} Resep...`}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditMode ? "Simpan" : `Simpan ${fields.length} Resep`}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
