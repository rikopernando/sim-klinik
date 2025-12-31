/**
 * Custom hook for creating multiple prescriptions
 * Handles form state and submission logic
 */

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { createInpatientPrescription } from "@/lib/services/inpatient.service"
import { type Drug } from "@/hooks/use-drug-search"
import { useCallback, useState } from "react"

const prescriptionItemSchema = z.object({
  drugId: z.string().min(1, "Obat harus dipilih"),
  drugName: z.string().min(1),
  drugPrice: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().min(1, "Frekuensi harus diisi"),
  route: z.string().optional(),
  quantity: z.number().int().positive("Jumlah harus positif"),
  instructions: z.string().optional(),
  isRecurring: z.boolean(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  administrationSchedule: z.string().optional(),
})

const prescriptionFormSchema = z.object({
  prescriptions: z.array(prescriptionItemSchema).min(1, "Minimal 1 resep harus ditambahkan"),
})

export type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>
export type PrescriptionItem = z.infer<typeof prescriptionItemSchema>

interface UseCreatePrescriptionsProps {
  visitId: string
  onSuccess?: () => void
  onClose?: () => void
}

export function useCreatePrescriptions({
  visitId,
  onSuccess,
  onClose,
}: UseCreatePrescriptionsProps) {
  const isEditMode = false
  const [drugSearches, setDrugSearches] = useState<Record<number, string>>({})
  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      prescriptions: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  })

  const addPrescription = useCallback(() => {
    append({
      drugId: "",
      drugName: "",
      drugPrice: "",
      dosage: "",
      frequency: "",
      route: "oral",
      quantity: 1,
      instructions: "",
      isRecurring: false,
      administrationSchedule: "",
    })
  }, [append])

  const handleDrugSelect = useCallback(
    (index: number, drug: Drug) => {
      form.setValue(`prescriptions.${index}.drugId`, drug.id, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugName`, drug.name, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugPrice`, drug.price, { shouldValidate: true })
      setDrugSearches((prev) => ({ ...prev, [index]: drug.name }))
    },
    [form]
  )

  const handleSubmit = async (data: PrescriptionFormData) => {
    try {
      // Submit all prescriptions
      await Promise.all(
        data.prescriptions.map((prescription) =>
          createInpatientPrescription({
            visitId,
            drugId: prescription.drugId,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            route: prescription.route,
            quantity: prescription.quantity,
            instructions: prescription.instructions,
            isRecurring: prescription.isRecurring,
            startDate: prescription.startDate?.toISOString() || undefined,
            endDate: prescription.endDate?.toISOString() || undefined,
            administrationSchedule: prescription.administrationSchedule || undefined,
          })
        )
      )

      toast.success(`${data.prescriptions.length} resep berhasil ditambahkan`)
      form.reset()
      onClose?.()
      onSuccess?.()
    } catch (error) {
      console.error("Error creating prescriptions:", error)
      toast.error("Gagal menambahkan resep")
    }
  }

  return {
    form,
    fields,
    drugSearches,
    addPrescription,
    removePrescription: remove,
    handleDrugSelect,
    handleSubmit,
    isEditMode,
    setDrugSearches,
    isSubmitting: form.formState.isSubmitting,
  }
}
