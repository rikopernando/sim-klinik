/**
 * useMaterialForm Hook
 * Custom hook for material recording form logic
 */

import { useState, useCallback, useMemo, Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import type { Service } from "@/hooks/use-service-search"
import { recordMaterialUsage } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"

const materialUsageFormSchema = z.object({
  serviceId: z.string(), // NEW: Service ID for service-based approach
  materialName: z.string().min(1, "Alat Kesehatan wajib diisi"),
  quantity: z.string().min(1, "Jumlah wajib diisi"),
  unitPrice: z.string().min(1, "Harga satuan wajib diisi"),
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
  serviceSearch: string
  setServiceSearch: Dispatch<SetStateAction<string>>
  handleMaterialSelect: (material: Service) => void
  handleSubmit: (data: MaterialFormData) => Promise<void>
  resetForm: () => void
}

export function useMaterialForm({
  visitId,
  onSuccess,
  onClose,
}: UseMaterialFormOptions): UseMaterialFormReturn {
  const [serviceSearch, setServiceSearch] = useState("")

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialUsageFormSchema),
    defaultValues: {
      serviceId: "", // NEW: Service ID
      materialName: "",
      quantity: "",
      unitPrice: "",
      notes: "",
    },
  })

  // Watch values for total price calculation
  const quantity = form.watch("quantity")
  const unitPrice = form.watch("unitPrice")

  // Memoize total price calculation
  const totalPrice = useMemo(() => {
    if (!quantity || !unitPrice) return "0.00"
    return (parseFloat(quantity) * parseFloat(unitPrice || "0")).toFixed(2)
  }, [quantity, unitPrice])

  // Handle material selection from autocomplete
  const handleMaterialSelect = useCallback(
    (material: Service) => {
      form.setValue("serviceId", material.id, { shouldValidate: true }) // NEW: Set service ID
      form.setValue("materialName", material.name, { shouldValidate: true })
      form.setValue("unitPrice", material.price, { shouldValidate: true })
      setServiceSearch(material.name)
    },
    [form]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: MaterialFormData) => {
      try {
        // Use service-based approach if serviceId exists, otherwise fallback to legacy
        await recordMaterialUsage({
          visitId,
          serviceId: data.serviceId, // NEW: Send serviceId (preferred)
          materialName: data.materialName, // Legacy fallback
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          notes: data.notes,
        })

        toast.success("Material berhasil dicatat", {
          description: `${data.materialName} x${data.quantity}`,
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
  }, [form])

  return {
    form,
    totalPrice,
    serviceSearch,
    setServiceSearch,
    handleMaterialSelect,
    handleSubmit,
    resetForm,
  }
}
