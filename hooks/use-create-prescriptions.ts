/**
 * Custom hook for creating multiple prescriptions
 * Handles form state and submission logic
 * Supports both regular drugs and compound recipes
 */

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useCallback, useState } from "react"

import { createInpatientPrescription } from "@/lib/services/inpatient.service"
import { type Drug } from "@/hooks/use-drug-search"
import { prescriptionItemSchema } from "@/lib/inpatient/validation"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

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
      isCompound: false,
      compoundRecipeId: "",
      compoundRecipeName: "",
      compoundRecipeCode: "",
      compoundRecipePrice: "",
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
      // Clear compound fields when selecting a drug
      form.setValue(`prescriptions.${index}.isCompound`, false, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipeId`, "", { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipeName`, "", { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipeCode`, "", { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipePrice`, "", { shouldValidate: true })
      // Set drug fields
      form.setValue(`prescriptions.${index}.drugId`, drug.id, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugName`, drug.name, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugPrice`, drug.price, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.route`, "oral", { shouldValidate: true })
      setDrugSearches((prev) => ({ ...prev, [index]: drug.name }))
    },
    [form]
  )

  const handleCompoundSelect = useCallback(
    (index: number, recipe: CompoundRecipeWithCreator) => {
      // Clear drug fields when selecting a compound
      form.setValue(`prescriptions.${index}.drugId`, "", { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugName`, "", { shouldValidate: true })
      form.setValue(`prescriptions.${index}.drugPrice`, "", { shouldValidate: true })
      // Set compound fields
      form.setValue(`prescriptions.${index}.isCompound`, true, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipeId`, recipe.id, { shouldValidate: true })
      form.setValue(`prescriptions.${index}.compoundRecipeName`, recipe.name, {
        shouldValidate: true,
      })
      form.setValue(`prescriptions.${index}.compoundRecipeCode`, recipe.code, {
        shouldValidate: true,
      })
      form.setValue(`prescriptions.${index}.compoundRecipePrice`, recipe.price || "0", {
        shouldValidate: true,
      })
      form.setValue(`prescriptions.${index}.route`, "compounded", { shouldValidate: true })
      // Auto-fill defaults from recipe
      if (recipe.defaultFrequency) {
        form.setValue(`prescriptions.${index}.frequency`, recipe.defaultFrequency, {
          shouldValidate: true,
        })
      }
      if (recipe.defaultInstructions) {
        form.setValue(`prescriptions.${index}.instructions`, recipe.defaultInstructions, {
          shouldValidate: true,
        })
      }
      setDrugSearches((prev) => ({ ...prev, [index]: recipe.name }))
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
            // Drug fields
            drugId: prescription.isCompound ? undefined : prescription.drugId,
            drugName: prescription.isCompound ? undefined : prescription.drugName,
            price: prescription.isCompound ? undefined : prescription.drugPrice,
            // Compound fields
            isCompound: prescription.isCompound,
            compoundRecipeId: prescription.isCompound ? prescription.compoundRecipeId : undefined,
            compoundRecipeName: prescription.isCompound
              ? prescription.compoundRecipeName
              : undefined,
            compoundRecipeCode: prescription.isCompound
              ? prescription.compoundRecipeCode
              : undefined,
            compoundRecipePrice: prescription.isCompound
              ? prescription.compoundRecipePrice
              : undefined,
            // Common fields
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

  // Create a bound submit handler that works with form.handleSubmit
  const onSubmit = form.handleSubmit(handleSubmit)

  return {
    form,
    fields,
    drugSearches,
    addPrescription,
    removePrescription: remove,
    handleDrugSelect,
    handleCompoundSelect,
    handleSubmit,
    onSubmit, // Pre-bound submit handler for use in form onSubmit
    isEditMode,
    setDrugSearches,
    isSubmitting: form.formState.isSubmitting,
  }
}
