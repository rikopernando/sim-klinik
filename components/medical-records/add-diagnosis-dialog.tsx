"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

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

import { addDiagnosis, updateDiagnosis } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type Diagnosis } from "@/types/medical-record"
import { formatIcdCode } from "@/lib/utils/medical-record"
import {
  DEFAULT_DIAGNOSIS_ITEM,
  createSecondaryDiagnosisItem,
  findDuplicateDiagnosis,
} from "@/lib/utils/diagnosis"
import { DiagnosisItem } from "./diagnosis-item"
import {
  CreateDiagnosisBulkFormData,
  createDiagnosisBulkFormSchema,
} from "@/lib/validations/medical-record"

interface AddDiagnosisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicalRecordId: string
  onSuccess: () => void
  diagnosis?: Diagnosis | null // If provided, it's edit mode
  existingDiagnoses?: Diagnosis[] // For duplicate checking
}

export function AddDiagnosisDialog({
  open,
  onOpenChange,
  medicalRecordId,
  onSuccess,
  diagnosis,
  existingDiagnoses = [],
}: AddDiagnosisDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditMode = !!diagnosis

  const form = useForm<CreateDiagnosisBulkFormData>({
    resolver: zodResolver(createDiagnosisBulkFormSchema),
    defaultValues: {
      diagnoses: [DEFAULT_DIAGNOSIS_ITEM],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "diagnoses",
  })

  // Reset form when dialog opens or diagnosis changes
  useEffect(() => {
    if (open) {
      const initialData =
        isEditMode && diagnosis
          ? {
              diagnoses: [
                {
                  icd10Code: diagnosis.icd10Code,
                  description: diagnosis.description,
                  diagnosisType: diagnosis.diagnosisType,
                },
              ],
            }
          : { diagnoses: [DEFAULT_DIAGNOSIS_ITEM] }

      form.reset(initialData)
      setError(null)
    }
  }, [open, diagnosis, isEditMode, form])

  const handleClose = useCallback(() => {
    form.reset()
    setError(null)
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleAddItem = useCallback(() => {
    append(createSecondaryDiagnosisItem())
  }, [append])

  const handleRemoveItem = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
      }
    },
    [fields.length, remove]
  )

  const onSubmit = useCallback(
    async (data: CreateDiagnosisBulkFormData) => {
      try {
        setIsSaving(true)
        setError(null)

        if (isEditMode && diagnosis) {
          // Edit mode: Check for duplicate (excluding current diagnosis)
          const formattedCode = formatIcdCode(data.diagnoses[0].icd10Code)
          const duplicate = findDuplicateDiagnosis(formattedCode, existingDiagnoses, diagnosis.id)

          if (duplicate) {
            setError(`Diagnosis dengan kode ${formattedCode} sudah ada dalam rekam medis ini`)
            return
          }

          await updateDiagnosis({
            diagnosisId: diagnosis.id,
            icd10Code: formattedCode,
            description: data.diagnoses[0].description,
            diagnosisType: data.diagnoses[0].diagnosisType as "primary" | "secondary",
          })

          toast.success("Diagnosis berhasil diupdate!")
        } else {
          // Add mode: Check for duplicates
          for (const diagnosisItem of data.diagnoses) {
            const formattedCode = formatIcdCode(diagnosisItem.icd10Code)
            const duplicate = findDuplicateDiagnosis(formattedCode, existingDiagnoses)

            if (duplicate) {
              setError(`Diagnosis dengan kode ${formattedCode} sudah ada dalam rekam medis ini`)
              return
            }
          }

          // Save all diagnoses sequentially
          for (const diagnosisItem of data.diagnoses) {
            await addDiagnosis({
              medicalRecordId,
              icd10Code: formatIcdCode(diagnosisItem.icd10Code),
              description: diagnosisItem.description,
              diagnosisType: diagnosisItem.diagnosisType as "primary" | "secondary",
            })
          }

          toast.success(`${data.diagnoses.length} diagnosis berhasil ditambahkan!`)
        }

        handleClose()
        onSuccess()
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        toast.error(`Gagal menyimpan diagnosis: ${errorMessage}`)
      } finally {
        setIsSaving(false)
      }
    },
    [isEditMode, diagnosis, existingDiagnoses, medicalRecordId, handleClose, onSuccess]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Diagnosis" : "Tambah Diagnosis"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Perbarui diagnosis berdasarkan kode ICD-10"
                : "Tambahkan satu atau lebih diagnosis berdasarkan kode ICD-10"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* Diagnosis Items */}
            {fields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <Separator className="my-4" />}
                <DiagnosisItem
                  index={index}
                  form={form}
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
                Tambah Diagnosis Lain
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
                  {isEditMode ? "Menyimpan..." : `Menyimpan ${fields.length} Diagnosis...`}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditMode ? "Simpan" : `Simpan ${fields.length} Diagnosis`}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
