/**
 * Custom hook for creating multiple procedures
 * Handles form state and submission logic
 */

import { useCallback, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"

import { createInpatientProcedure } from "@/lib/services/inpatient.service"
import { type Service } from "@/hooks/use-service-search"

const procedureItemSchema = z.object({
  serviceId: z.string().optional(),
  serviceName: z.string().min(1, "Nama tindakan harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  icd9Code: z.string().optional(),
  servicePrice: z.string().optional(),
  scheduledDate: z.date().optional(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
})

const procedureFormSchema = z.object({
  procedures: z.array(procedureItemSchema).min(1, "Minimal 1 tindakan harus ditambahkan"),
})

export type ProcedureFormData = z.infer<typeof procedureFormSchema>
export type ProcedureItem = z.infer<typeof procedureItemSchema>

interface UseCreateProceduresProps {
  visitId: string
  onSuccess?: () => void
  onClose?: () => void
}

export function useCreateProcedures({ visitId, onSuccess, onClose }: UseCreateProceduresProps) {
  const [serviceSearches, setServiceSearches] = useState<Record<number, string>>({})

  const form = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      procedures: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedures",
  })

  const addProcedure = useCallback(() => {
    append({
      serviceId: "",
      serviceName: "",
      description: "",
      icd9Code: "",
      notes: "",
    })
  }, [append])

  const handleServiceSelect = useCallback(
    (service: Service, index: number) => {
      // Auto-fill service data
      form.setValue(`procedures.${index}.serviceId`, service.id, { shouldValidate: true })
      form.setValue(`procedures.${index}.serviceName`, service.name, { shouldValidate: true })
      form.setValue(`procedures.${index}.servicePrice`, service.price, { shouldValidate: true })
      form.setValue(`procedures.${index}.icd9Code`, service.code, { shouldValidate: true })
      form.setValue(`procedures.${index}.description`, service.description || service.name, {
        shouldValidate: true,
      })
      setServiceSearches((prev) => ({ ...prev, [index]: service.name }))
    },
    [form]
  )

  const handleRemoveProcedure = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index)
      }
    },
    [fields.length, remove]
  )

  const handleSubmit = useCallback(
    async (data: ProcedureFormData) => {
      try {
        // Submit all procedures
        await Promise.all(
          data.procedures.map((procedure) => {
            const scheduledAt = procedure.scheduledDate
              ? `${format(procedure.scheduledDate, "yyyy-MM-dd")}T${procedure.scheduledTime || "00:00"}:00`
              : undefined

            return createInpatientProcedure({
              visitId,
              serviceId: procedure.serviceId,
              description: procedure.description,
              icd9Code: procedure.icd9Code,
              notes: procedure.notes,
              scheduledAt,
            })
          })
        )

        toast.success(`${data.procedures.length} tindakan berhasil ditambahkan`)
        form.reset()
        onClose?.()
        onSuccess?.()
      } catch (error) {
        console.error("Error creating procedures:", error)
        toast.error("Gagal menambahkan tindakan")
      }
    },
    [form, onClose, onSuccess, visitId]
  )

  return {
    form,
    fields,
    addProcedure,
    serviceSearches,
    setServiceSearches,
    removeProcedure: handleRemoveProcedure,
    handleServiceSelect,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
  }
}
