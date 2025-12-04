"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2, X } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { addProcedure, updateProcedure } from "@/lib/services/medical-record.service"
import {
  getMedicalStaff,
  formatMedicalStaffName,
  type MedicalStaff,
} from "@/lib/services/medical-staff.service"
import { getErrorMessage } from "@/lib/utils/error"
import { formatIcdCode } from "@/lib/utils/medical-record"
import { type Procedure } from "@/types/medical-record"
import { type Service } from "@/hooks/use-service-search"
import { ServiceSearch } from "./service-search"

interface AddProcedureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicalRecordId: string
  onSuccess: () => void
  procedure?: Procedure | null // If provided, it's edit mode
  existingProcedures?: Procedure[] // For duplicate checking
}

// Validation schema for a single procedure item
const procedureItemSchema = z.object({
  serviceId: z.number().min(1, "Tindakan wajib dipilih"),
  serviceName: z.string().min(1, "Tindakan wajib dipilih"),
  servicePrice: z.string().optional(),
  icd9Code: z.string().min(1, "Kode ICD-9 wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  performedBy: z.string().min(1, "Dilakukan oleh wajib diisi"),
  notes: z.string().optional(),
})

// Schema for the entire form with array of procedures
const procedureFormSchema = z.object({
  procedures: z.array(procedureItemSchema).min(1, "Minimal 1 tindakan harus ditambahkan"),
})

type ProcedureFormData = z.infer<typeof procedureFormSchema>

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

  const form = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      procedures: [
        {
          serviceId: 0,
          serviceName: "",
          servicePrice: "",
          icd9Code: "",
          description: "",
          performedBy: "",
          notes: "",
        },
      ],
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
              serviceId: procedure.serviceId || 0,
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
          procedures: [
            {
              serviceId: 0,
              serviceName: "",
              servicePrice: "",
              icd9Code: "",
              description: "",
              performedBy: "",
              notes: "",
            },
          ],
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

  const resetForm = () => {
    form.reset()
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleAddItem = () => {
    append({
      serviceId: 0,
      serviceName: "",
      servicePrice: "",
      icd9Code: "",
      description: "",
      performedBy: "",
      notes: "",
    })
  }

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleServiceSelect = (index: number, service: Service) => {
    // Auto-fill service data
    form.setValue(`procedures.${index}.serviceId`, service.id)
    form.setValue(`procedures.${index}.serviceName`, service.name)
    form.setValue(`procedures.${index}.servicePrice`, service.price)
    form.setValue(`procedures.${index}.icd9Code`, service.code)
    form.setValue(`procedures.${index}.description`, service.description || service.name)
    setServiceSearches((prev) => ({ ...prev, [index]: service.name }))
  }

  const onSubmit = async (data: ProcedureFormData) => {
    try {
      setIsSaving(true)
      setError(null)

      if (isEditMode && procedure) {
        // Edit mode: Check for duplicate (excluding current procedure)
        const duplicate = existingProcedures.find(
          (p) => p.id !== procedure.id && p.serviceId === data.procedures[0].serviceId
        )
        if (duplicate) {
          setError(`Tindakan "${data.procedures[0].serviceName}" sudah ada dalam rekam medis ini`)
          setIsSaving(false)
          return
        }

        await updateProcedure(procedure.id, {
          serviceId: data.procedures[0].serviceId || undefined,
          icd9Code: formatIcdCode(data.procedures[0].icd9Code),
          description: data.procedures[0].description,
          performedBy: data.procedures[0].performedBy,
          notes: data.procedures[0].notes || undefined,
        })
      } else {
        // Add mode: Check for duplicates
        for (const procedureItem of data.procedures) {
          const duplicate = existingProcedures.find((p) => p.serviceId === procedureItem.serviceId)
          if (duplicate) {
            setError(`Tindakan "${procedureItem.serviceName}" sudah ada dalam rekam medis ini`)
            setIsSaving(false)
            return
          }
        }

        // Save all procedures sequentially
        for (const procedureItem of data.procedures) {
          await addProcedure({
            medicalRecordId,
            serviceId: procedureItem.serviceId || undefined,
            icd9Code: formatIcdCode(procedureItem.icd9Code),
            description: procedureItem.description,
            performedBy: procedureItem.performedBy,
            notes: procedureItem.notes || undefined,
          })
        }
      }

      handleClose()
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

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
              <div key={field.id} className="space-y-4">
                {index > 0 && <Separator />}

                {/* Item Header (only show in add mode) */}
                {!isEditMode && (
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Tindakan #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-destructive text-destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Hapus
                      </Button>
                    )}
                  </div>
                )}

                {/* Service Search */}
                <ServiceSearch
                  value={serviceSearches[index] || ""}
                  onChange={(value) => {
                    setServiceSearches((prev) => ({ ...prev, [index]: value }))
                    form.setValue(`procedures.${index}.serviceName`, value)
                  }}
                  onSelect={(service) => handleServiceSelect(index, service)}
                  label="Nama Tindakan"
                  placeholder="Ketik untuk mencari tindakan medis..."
                  required
                />
                {form.formState.errors.procedures?.[index]?.serviceName && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.procedures[index]?.serviceName?.message}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Price (Auto-filled, Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor={`servicePrice-${index}`}>Harga Tindakan</Label>
                    <Input
                      id={`servicePrice-${index}`}
                      value={
                        form.watch(`procedures.${index}.servicePrice`)
                          ? `Rp ${parseFloat(form.watch(`procedures.${index}.servicePrice`) || "0").toLocaleString("id-ID")}`
                          : "Rp -"
                      }
                      placeholder="Otomatis terisi dari pilihan tindakan"
                      className="bg-muted font-medium"
                      readOnly
                    />
                    <p className="text-muted-foreground text-xs">
                      Harga otomatis terisi saat memilih tindakan
                    </p>
                  </div>

                  {/* Performed By */}
                  <div className="space-y-2">
                    <Label htmlFor={`performedBy-${index}`}>
                      Dilakukan Oleh <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.watch(`procedures.${index}.performedBy`)}
                      onValueChange={(value) =>
                        form.setValue(`procedures.${index}.performedBy`, value)
                      }
                      disabled={loadingStaff}
                    >
                      <SelectTrigger className="w-full" id={`performedBy-${index}`}>
                        {loadingStaff ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Memuat...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Pilih dokter/perawat" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {medicalStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {formatMedicalStaffName(staff)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.procedures?.[index]?.performedBy && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.procedures[index]?.performedBy?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description (Auto-filled but editable) */}
                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>
                    Deskripsi Tindakan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`description-${index}`}
                    {...form.register(`procedures.${index}.description`)}
                    placeholder="Otomatis terisi dari pilihan tindakan (dapat diedit)"
                  />
                  {form.formState.errors.procedures?.[index]?.description && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.procedures[index]?.description?.message}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Deskripsi otomatis terisi, dapat diubah sesuai kebutuhan
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor={`notes-${index}`}>Catatan</Label>
                  <Textarea
                    id={`notes-${index}`}
                    {...form.register(`procedures.${index}.notes`)}
                    placeholder="Catatan tambahan mengenai tindakan"
                    rows={2}
                  />
                </div>
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
