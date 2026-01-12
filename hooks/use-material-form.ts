/**
 * useMaterialForm Hook
 * Custom hook for material recording form logic
 * Uses unified inventory system
 */

import { useState, useCallback, useMemo, Dispatch, SetStateAction, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import type { Material } from "@/types/material"
import { recordMaterialUsage } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"

const materialUsageFormSchema = z.object({
  itemId: z.string().min(1, "Material harus dipilih"), // Unified inventory item ID
  materialName: z.string().min(1, "Alat Kesehatan wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  quantity: z.string().min(1, "Jumlah wajib diisi"),
  unitPrice: z.string().min(1, "Harga satuan wajib diisi"),
  availableStock: z.number().optional(), // For display only
  notes: z.string().optional(),
})

export type MaterialFormData = z.infer<typeof materialUsageFormSchema>

interface UseMaterialFormOptions {
  visitId: string
  onSuccess?: () => void
  onClose?: () => void
}

interface UseMaterialFormReturn {
  form: ReturnType<typeof useForm<MaterialFormData>>
  totalPrice: string
  materialSearch: string
  setMaterialSearch: Dispatch<SetStateAction<string>>
  handleMaterialSelect: (material: Material) => void
  handleSubmit: (data: MaterialFormData) => Promise<void>
  resetForm: () => void
  values: MaterialFormData
}

const DEFAULT_VALUES = {
  itemId: "",
  materialName: "",
  unit: "",
  quantity: "",
  unitPrice: "",
  availableStock: 0,
  notes: "",
}

export function useMaterialForm({
  visitId,
  onSuccess,
  onClose,
}: UseMaterialFormOptions): UseMaterialFormReturn {
  const [values, setValues] = useState<MaterialFormData>(DEFAULT_VALUES)
  const [materialSearch, setMaterialSearch] = useState("")

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialUsageFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // Memoize total price calculation
  const totalPrice = useMemo(() => {
    if (!values.quantity || !values.unitPrice) return "0.00"
    return (parseFloat(values.quantity) * parseFloat(values.unitPrice || "0")).toFixed(2)
  }, [values.quantity, values.unitPrice])

  // Handle material selection from autocomplete
  const handleMaterialSelect = useCallback(
    (material: Material) => {
      form.setValue("itemId", material.id, { shouldValidate: true })
      form.setValue("materialName", material.name, { shouldValidate: true })
      form.setValue("unit", material.unit, { shouldValidate: true })
      form.setValue("unitPrice", material.price, { shouldValidate: true })
      form.setValue("availableStock", parseFloat(material.totalStock), { shouldValidate: true })
      setMaterialSearch(material.name)
    },
    [form]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: MaterialFormData) => {
      try {
        // Check if sufficient stock
        if (data.availableStock !== undefined && parseFloat(data.quantity) > data.availableStock) {
          toast.error("Stok tidak mencukupi", {
            description: `Stok tersedia: ${data.availableStock} ${data.unit}`,
          })
          return
        }

        await recordMaterialUsage({
          visitId,
          itemId: data.itemId, // Unified inventory item ID
          quantity: data.quantity,
          notes: data.notes,
        })

        toast.success("Material berhasil dicatat", {
          description: `${data.materialName} x${data.quantity} ${data.unit}`,
        })

        // Reset form and close dialog
        form.reset()
        onClose?.()
        onSuccess?.()
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
    },
    [form, onClose, onSuccess, visitId]
  )

  // Reset form
  const resetForm = useCallback(() => {
    form.reset()
    setMaterialSearch("")
  }, [form])

  useEffect(() => {
    const subscription = form.watch((formValues) => {
      setValues(formValues as MaterialFormData)
    })

    return () => subscription.unsubscribe()
  }, [form, form.watch])

  return {
    form,
    values,
    totalPrice,
    materialSearch,
    setMaterialSearch,
    handleMaterialSelect,
    handleSubmit,
    resetForm,
  }
}
