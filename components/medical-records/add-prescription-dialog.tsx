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

import { addPrescription, updatePrescription } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { MEDICATION_ROUTES, type Prescription } from "@/types/medical-record"
import { type Drug } from "@/hooks/use-drug-search"
import { DrugSearch } from "./drug-search"

interface AddPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicalRecordId: number
  onSuccess: () => void
  prescription?: Prescription | null // If provided, it's edit mode
  existingPrescriptions?: Prescription[] // For duplicate checking
}

// Predefined frequency options
const FREQUENCY_OPTIONS = [
  { value: "3x1_setelah_makan", label: "3 x 1 Setelah Makan" },
  { value: "3x1_sebelum_makan", label: "3 x 1 Sebelum Makan" },
  { value: "2x1_setelah_makan", label: "2 x 1 Setelah Makan" },
  { value: "2x1_sebelum_makan", label: "2 x 1 Sebelum Makan" },
  { value: "1x1_setelah_makan", label: "1 x 1 Setelah Makan" },
  { value: "1x1_sebelum_makan", label: "1 x 1 Sebelum Makan" },
  { value: "3x1", label: "3 x 1" },
  { value: "2x1", label: "2 x 1" },
  { value: "1x1", label: "1 x 1" },
  { value: "bila_perlu", label: "Bila Perlu" },
] as const

// Validation schema for a single prescription item
const prescriptionItemSchema = z.object({
  drugId: z.number().min(1, "Obat wajib dipilih"),
  drugName: z.string().min(1, "Nama obat wajib diisi"),
  drugPrice: z.string().optional(),
  dosage: z.string().optional(), // Made optional per feedback 4.5
  frequency: z.string().min(1, "Frekuensi wajib diisi"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  instructions: z.string().optional(),
  route: z.string().optional(),
})

// Schema for the entire form with array of prescriptions
const prescriptionFormSchema = z.object({
  prescriptions: z.array(prescriptionItemSchema).min(1, "Minimal 1 resep harus ditambahkan"),
})

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>

export function AddPrescriptionDialog({
  open,
  onOpenChange,
  medicalRecordId,
  onSuccess,
  prescription,
  existingPrescriptions = [],
}: AddPrescriptionDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drugSearches, setDrugSearches] = useState<Record<number, string>>({})
  const isEditMode = !!prescription

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      prescriptions: [
        {
          drugId: 0,
          drugName: "",
          drugPrice: "",
          dosage: "",
          frequency: "",
          quantity: 1,
          instructions: "",
          route: "oral",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  })

  // Reset form when dialog opens or prescription changes
  useEffect(() => {
    if (open) {
      if (isEditMode && prescription) {
        form.reset({
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
        })
        setDrugSearches({ 0: prescription.drugName })
      } else {
        form.reset({
          prescriptions: [
            {
              drugId: 0,
              drugName: "",
              drugPrice: "",
              dosage: "",
              frequency: "",
              quantity: 1,
              instructions: "",
              route: "oral",
            },
          ],
        })
        setDrugSearches({})
      }
    }
  }, [open, prescription, isEditMode, form])

  const resetForm = () => {
    form.reset()
    setDrugSearches({})
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleDrugSelect = (index: number, drug: Drug) => {
    form.setValue(`prescriptions.${index}.drugId`, drug.id)
    form.setValue(`prescriptions.${index}.drugName`, drug.name)
    form.setValue(`prescriptions.${index}.drugPrice`, drug.price)
    setDrugSearches((prev) => ({ ...prev, [index]: drug.name }))
  }

  const handleAddItem = () => {
    append({
      drugId: 0,
      drugName: "",
      drugPrice: "",
      dosage: "",
      frequency: "",
      quantity: 1,
      instructions: "",
      route: "oral",
    })
  }

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
      // Clean up drug search for removed item
      setDrugSearches((prev) => {
        const newSearches = { ...prev }
        delete newSearches[index]
        return newSearches
      })
    }
  }

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      setIsSaving(true)
      setError(null)

      if (isEditMode && prescription) {
        // Edit mode: Check for duplicate (excluding current prescription)
        const duplicate = existingPrescriptions.find(
          (p) => p.id !== prescription.id && p.drugId === data.prescriptions[0].drugId
        )
        if (duplicate) {
          setError(
            `Resep untuk obat "${data.prescriptions[0].drugName}" sudah ada dalam rekam medis ini`
          )
          setIsSaving(false)
          return
        }

        await updatePrescription(prescription.id, {
          drugId: data.prescriptions[0].drugId,
          dosage: data.prescriptions[0].dosage || undefined,
          frequency: data.prescriptions[0].frequency,
          quantity: data.prescriptions[0].quantity,
          instructions: data.prescriptions[0].instructions || undefined,
          route: data.prescriptions[0].route || undefined,
        })
      } else {
        // Add mode: Check for duplicates
        for (const prescriptionItem of data.prescriptions) {
          const duplicate = existingPrescriptions.find((p) => p.drugId === prescriptionItem.drugId)
          if (duplicate) {
            setError(
              `Resep untuk obat "${prescriptionItem.drugName}" sudah ada dalam rekam medis ini`
            )
            setIsSaving(false)
            return
          }
        }

        // Save all prescriptions sequentially
        for (const prescriptionItem of data.prescriptions) {
          await addPrescription({
            medicalRecordId,
            drugId: prescriptionItem.drugId,
            dosage: prescriptionItem.dosage || undefined,
            frequency: prescriptionItem.frequency,
            quantity: prescriptionItem.quantity,
            instructions: prescriptionItem.instructions || undefined,
            route: prescriptionItem.route || undefined,
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
              <div key={field.id} className="space-y-4">
                {index > 0 && <Separator />}

                {/* Item Header (only show in add mode) */}
                {!isEditMode && (
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Resep #{index + 1}</h4>
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

                {/* Drug Search */}
                <DrugSearch
                  value={drugSearches[index] || ""}
                  onChange={(value) => setDrugSearches((prev) => ({ ...prev, [index]: value }))}
                  onSelect={(drug) => handleDrugSelect(index, drug)}
                  required
                />
                {form.formState.errors.prescriptions?.[index]?.drugId && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.prescriptions[index]?.drugId?.message}
                  </p>
                )}

                {/* Price Display (Read-only) */}
                {form.watch(`prescriptions.${index}.drugPrice`) && (
                  <div className="space-y-2">
                    <Label htmlFor={`drugPrice-${index}`}>Harga Satuan</Label>
                    <Input
                      id={`drugPrice-${index}`}
                      value={`Rp ${parseFloat(form.watch(`prescriptions.${index}.drugPrice`) || "0").toLocaleString("id-ID")}`}
                      placeholder="Otomatis terisi dari pilihan obat"
                      className="bg-muted font-medium"
                      readOnly
                    />
                    <p className="text-muted-foreground text-xs">
                      Harga per{" "}
                      {form.watch(`prescriptions.${index}.drugName`)?.split(" ").pop() || "unit"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Dosage - Now optional */}
                  <div className="space-y-2">
                    <Label htmlFor={`dosage-${index}`}>Dosis</Label>
                    <Input
                      id={`dosage-${index}`}
                      {...form.register(`prescriptions.${index}.dosage`)}
                      placeholder="Contoh: 500mg, 1 tablet"
                    />
                    {form.formState.errors.prescriptions?.[index]?.dosage && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.prescriptions[index]?.dosage?.message}
                      </p>
                    )}
                  </div>

                  {/* Frequency - Now dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor={`frequency-${index}`}>
                      Frekuensi <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.watch(`prescriptions.${index}.frequency`)}
                      onValueChange={(value) =>
                        form.setValue(`prescriptions.${index}.frequency`, value)
                      }
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
                    {form.formState.errors.prescriptions?.[index]?.frequency && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.prescriptions[index]?.frequency?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>
                      Jumlah <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      {...form.register(`prescriptions.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    {form.formState.errors.prescriptions?.[index]?.quantity && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.prescriptions[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  {/* Route */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`route-${index}`}>Rute Pemberian</Label>
                    <Select
                      value={form.watch(`prescriptions.${index}.route`)}
                      onValueChange={(value) =>
                        form.setValue(`prescriptions.${index}.route`, value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICATION_ROUTES.map((route) => (
                          <SelectItem key={route.value} value={route.value}>
                            {route.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor={`instructions-${index}`}>Instruksi Tambahan</Label>
                  <Textarea
                    id={`instructions-${index}`}
                    {...form.register(`prescriptions.${index}.instructions`)}
                    placeholder="Contoh: Diminum setelah makan"
                    rows={2}
                  />
                </div>
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
