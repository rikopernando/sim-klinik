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

import { addProcedure, updateProcedure } from "@/lib/services/medical-record.service"
import { getMedicalStaff, type MedicalStaff } from "@/lib/services/medical-staff.service"
import { getErrorMessage } from "@/lib/utils/error"
import { formatIcdCode } from "@/lib/utils/medical-record"
import {
  DEFAULT_PROCEDURE_ITEM,
  findDuplicateProcedure,
  createProcedureItem,
} from "@/lib/utils/procedure"
import { type Procedure } from "@/types/medical-record"
import { type Service } from "@/hooks/use-service-search"
import { ProcedureFormBulkData, procedureFormBulkSchema } from "@/lib/validations/medical-record"

import { ProcedureItem } from "./procedure-item"

interface AddProcedureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicalRecordId: string
  onSuccess: () => void
  procedure?: Procedure | null // If provided, it's edit mode
  existingProcedures?: Procedure[] // For duplicate checking
}

export function AddProcedureDialog({
  open,
  onOpenChange,
  medicalRecordId,
  onSuccess,
  procedure,
  existingProcedures = [],
}: AddProcedureDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [serviceSearches, setServiceSearches] = useState<Record<number, string>>({})
  const isEditMode = !!procedure

  const form = useForm<ProcedureFormBulkData>({
    resolver: zodResolver(procedureFormBulkSchema),
    defaultValues: {
      procedures: [DEFAULT_PROCEDURE_ITEM],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedures",
  })

  // Reset form when dialog opens or procedure changes
  useEffect(() => {
    if (open) {
      if (isEditMode && procedure) {
        form.reset({
          procedures: [
            {
              serviceId: procedure.serviceId || "",
              serviceName: procedure.serviceName || procedure.description,
              servicePrice: procedure.servicePrice || "",
              icd9Code: procedure.icd9Code,
              description: procedure.description,
              performedBy: procedure.performedBy || "",
              notes: procedure.notes || "",
            },
          ],
        })
        setServiceSearches({ 0: procedure.serviceName || procedure.description })
      } else {
        form.reset({
          procedures: [DEFAULT_PROCEDURE_ITEM],
        })
        setServiceSearches({})
      }
    }
  }, [open, procedure, isEditMode, form])

  // Fetch medical staff when dialog opens
  useEffect(() => {
    if (open) {
      const fetchMedicalStaff = async () => {
        setLoadingStaff(true)
        try {
          const staff = await getMedicalStaff()
          setMedicalStaff(staff)
        } catch (err) {
          console.error("Error fetching medical staff:", err)
          setError("Gagal memuat daftar tenaga medis")
        } finally {
          setLoadingStaff(false)
        }
      }

      fetchMedicalStaff()
    }
  }, [open])

  const handleClose = useCallback(() => {
    form.reset()
    setServiceSearches({})
    setError(null)
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleAddItem = useCallback(() => {
    append(createProcedureItem())
  }, [append])

  const handleRemoveItem = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
      }
    },
    [fields.length, remove]
  )

  const handleServiceSelect = useCallback(
    (index: number, service: Service) => {
      // Auto-fill service data
      form.setValue(`procedures.${index}.serviceId`, service.id)
      form.setValue(`procedures.${index}.serviceName`, service.name)
      form.setValue(`procedures.${index}.servicePrice`, service.price)
      form.setValue(`procedures.${index}.icd9Code`, service.code)
      form.setValue(`procedures.${index}.description`, service.description || service.name)
      setServiceSearches((prev) => ({ ...prev, [index]: service.name }))
    },
    [form]
  )

  const onSubmit = useCallback(
    async (data: ProcedureFormBulkData) => {
      try {
        setIsSaving(true)
        setError(null)

        if (isEditMode && procedure) {
          // Edit mode: Check for duplicate (excluding current procedure)
          const duplicate = findDuplicateProcedure(
            data.procedures[0].serviceId,
            existingProcedures,
            procedure.id
          )
          if (duplicate) {
            const errorMsg = `Tindakan "${data.procedures[0].serviceName}" sudah ada dalam rekam medis ini`
            setError(errorMsg)
            toast.error(errorMsg)
            setIsSaving(false)
            return
          }

          await updateProcedure(procedure.id, {
            serviceId: data.procedures[0].serviceId,
            serviceName: data.procedures[0].serviceName,
            icd9Code: formatIcdCode(data.procedures[0].icd9Code),
            description: data.procedures[0].description,
            performedBy: data.procedures[0].performedBy,
            notes: data.procedures[0].notes || undefined,
          })

          toast.success("Tindakan berhasil diupdate!")
        } else {
          // Add mode: Check for duplicates
          for (const procedureItem of data.procedures) {
            const duplicate = findDuplicateProcedure(procedureItem.serviceId, existingProcedures)
            if (duplicate) {
              const errorMsg = `Tindakan "${procedureItem.serviceName}" sudah ada dalam rekam medis ini`
              setError(errorMsg)
              toast.error(errorMsg)
              setIsSaving(false)
              return
            }
          }

          // Save all procedures sequentially
          for (const procedureItem of data.procedures) {
            await addProcedure({
              medicalRecordId,
              serviceId: procedureItem.serviceId,
              serviceName: procedureItem.serviceName,
              icd9Code: formatIcdCode(procedureItem.icd9Code),
              description: procedureItem.description,
              performedBy: procedureItem.performedBy,
              notes: procedureItem.notes || undefined,
            })
          }

          toast.success(`${data.procedures.length} tindakan berhasil ditambahkan!`)
        }

        handleClose()
        onSuccess()
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        toast.error(`Gagal menyimpan tindakan: ${errorMessage}`)
      } finally {
        setIsSaving(false)
      }
    },
    [isEditMode, procedure, existingProcedures, medicalRecordId, handleClose, onSuccess]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Tindakan" : "Tambah Tindakan"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Perbarui tindakan medis berdasarkan kode ICD-9"
                : "Tambahkan satu atau lebih tindakan medis berdasarkan kode ICD-9"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {/* Procedure Items */}
            {fields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <Separator className="my-4" />}
                <ProcedureItem
                  index={index}
                  form={form}
                  serviceSearch={serviceSearches[index] || ""}
                  onServiceSearchChange={(value) => {
                    setServiceSearches((prev) => ({ ...prev, [index]: value }))
                    form.setValue(`procedures.${index}.serviceName`, value)
                  }}
                  onServiceSelect={(service) => handleServiceSelect(index, service)}
                  medicalStaff={medicalStaff}
                  loadingStaff={loadingStaff}
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
                Tambah Tindakan Lain
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
                  {isEditMode ? "Menyimpan..." : `Menyimpan ${fields.length} Tindakan...`}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditMode ? "Simpan" : `Simpan ${fields.length} Tindakan`}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
