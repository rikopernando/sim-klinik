/**
 * Add Inventory Dialog Component (Refactored with react-hook-form)
 * Form for adding new drug inventory (stock incoming)
 */

"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError } from "@/components/ui/field"
import { DrugSearch } from "@/components/medical-records/drug-search"
import { useBatchDuplicateCheck } from "@/hooks/use-batch-duplicate-check"
import { type Drug } from "@/hooks/use-drug-search"
import { addInventory } from "@/lib/services/inventory.service"
import { getErrorMessage } from "@/lib/utils/error"

import { BatchDuplicateWarning } from "./inventory/batch-duplicate-warning"
import { InventoryFormFields, type InventoryFormData } from "./inventory/inventory-form-fields"

interface AddInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Form schema that matches the form data structure with Date objects
const inventoryFormSchema = z.object({
  drugId: z.string().min(1, "Obat harus dipilih"),
  drugName: z.string().min(1, "Nama obat wajib diisi"),
  drugUnit: z.string(),
  batchNumber: z.string().min(1, "Nomor batch wajib diisi"),
  expiryDate: z.date({
    message: "Tanggal kadaluarsa wajib diisi",
  }),
  stockQuantity: z.number().int().positive("Jumlah stok harus lebih dari 0"),
  purchasePrice: z.string().optional(),
  supplier: z.string().optional(),
  receivedDate: z.date({
    message: "Tanggal terima wajib diisi",
  }),
}) satisfies z.ZodType<InventoryFormData>

export function AddInventoryDialog({ open, onOpenChange, onSuccess }: AddInventoryDialogProps) {
  const [drugSearch, setDrugSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      drugId: "",
      drugName: "",
      drugUnit: "",
      batchNumber: "",
      expiryDate: undefined,
      stockQuantity: 0,
      purchasePrice: "",
      supplier: "",
      receivedDate: new Date(),
    },
  })

  const watchedDrugId = form.watch("drugId")
  const watchedBatchNumber = form.watch("batchNumber")

  // Batch duplicate check
  const {
    duplicateCheck,
    isChecking,
    isDuplicate,
    reset: resetDuplicateCheck,
  } = useBatchDuplicateCheck({
    drugId: watchedDrugId,
    batchNumber: watchedBatchNumber,
  })

  // Handle drug selection
  const handleDrugSelect = useCallback(
    (drug: Drug) => {
      form.setValue("drugId", drug.id)
      form.setValue("drugName", drug.name)
      form.setValue("drugUnit", drug.unit || "")
      setDrugSearch(drug.name)
      resetDuplicateCheck()
    },
    [form, resetDuplicateCheck]
  )

  // Handle form submission
  const handleSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true)

    try {
      await addInventory({
        ...data,
        expiryDate: data.expiryDate.toISOString(),
        receivedDate: data.receivedDate.toISOString(),
      })
      toast.success("Stok obat berhasil ditambahkan")
      onSuccess()
      onOpenChange(false)
      setDrugSearch("")
      resetDuplicateCheck()
      form.reset()
    } catch (error) {
      console.error("Error adding inventory:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Tambah Stok Obat</DialogTitle>
          <DialogDescription>
            Catat pemasukan stok obat baru dengan batch number dan tanggal kadaluarsa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Drug Selection */}
          <Field>
            <FieldContent>
              <DrugSearch
                label="Nama Obat"
                value={drugSearch}
                onChange={setDrugSearch}
                onSelect={handleDrugSelect}
                required
              />
              <FieldError errors={[form.formState.errors.drugId]} />
            </FieldContent>
          </Field>

          {/* Inventory Form Fields */}
          <InventoryFormFields
            control={form.control}
            errors={form.formState.errors}
            disabled={isSubmitting}
          />

          {/* Duplicate Warning */}
          {isDuplicate && duplicateCheck && (
            <BatchDuplicateWarning duplicateCheck={duplicateCheck} />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isChecking}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
