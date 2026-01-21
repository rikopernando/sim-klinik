/**
 * Custom hook for managing core medical record data and operations
 * Uses React Query for efficient data fetching and caching
 *
 * Note: Diagnoses, procedures, and prescriptions are now fetched lazily
 * by their respective tab components using separate hooks:
 * - useDiagnoses
 * - useProcedures
 * - usePrescriptions
 */

import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getMedicalRecordByVisit,
  updateMedicalRecordByVisit,
  lockMedicalRecord,
  unlockMedicalRecord,
} from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type MedicalRecordCoreData } from "@/types/medical-record"
import { toast } from "sonner"

// Query keys for cache management
export const medicalRecordKeys = {
  all: ["medical-records"] as const,
  core: (visitId: string) => [...medicalRecordKeys.all, "core", visitId] as const,
}

interface UseMedicalRecordOptions {
  visitId: string
}

interface UseMedicalRecordReturn {
  // Data
  coreData: MedicalRecordCoreData | null
  isLocked: boolean
  isDraft: boolean

  // Loading states
  isLoading: boolean
  isSaving: boolean
  isLocking: boolean

  // Error handling
  error: string | null
  clearError: () => void

  // Operations
  refetch: () => Promise<void>
  saveSOAP: (soapData: {
    soapSubjective?: string
    soapObjective?: string
    soapAssessment?: string
    soapPlan?: string
  }) => Promise<void>
  saveDraft: () => Promise<void>
  lockRecord: (billingAdjustment?: number, adjustmentNote?: string) => Promise<void>
  unlockRecord: () => Promise<void>
  updateRecord: (updates: Partial<MedicalRecordCoreData["medicalRecord"]>) => void
}

export function useMedicalRecord({ visitId }: UseMedicalRecordOptions): UseMedicalRecordReturn {
  const queryClient = useQueryClient()

  // Fetch core medical record and visit info only
  const coreQuery = useQuery({
    queryKey: medicalRecordKeys.core(visitId),
    queryFn: () => getMedicalRecordByVisit(visitId),
    enabled: !!visitId,
  })

  // Error handling
  const error = coreQuery.error ? getErrorMessage(coreQuery.error) : null

  // Refetch core data
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.core(visitId) })
  }, [queryClient, visitId])

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!coreQuery.data) return

    try {
      await updateMedicalRecordByVisit(visitId, { isDraft: true })
      await refetch()
      toast.success("Draft berhasil disimpan!")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      toast.error(`Gagal menyimpan draft: ${errorMessage}`)
      throw err
    }
  }, [visitId, coreQuery.data, refetch])

  // Lock record
  const lockRecord = useCallback(
    async (billingAdjustment?: number, adjustmentNote?: string) => {
      if (!coreQuery.data) return

      try {
        await lockMedicalRecord({
          id: coreQuery.data.medicalRecord.id,
          billingAdjustment,
          adjustmentNote,
        })
        await refetch()
        toast.success("Rekam medis berhasil dikunci!")
      } catch (err) {
        toast.error("Gagal mengunci rekam medis")
        throw err
      }
    },
    [coreQuery.data, refetch]
  )

  // Unlock record
  const unlockRecord = useCallback(async () => {
    if (!coreQuery.data) return

    try {
      await unlockMedicalRecord(coreQuery.data.medicalRecord.id)
      await refetch()
      toast.success("Rekam medis berhasil dibuka!")
    } catch (err) {
      toast.error("Gagal membuka kunci rekam medis")
      throw err
    }
  }, [coreQuery.data, refetch])

  // Save SOAP
  const saveSOAP = useCallback(
    async (soapData: {
      soapSubjective?: string
      soapObjective?: string
      soapAssessment?: string
      soapPlan?: string
    }) => {
      if (!coreQuery.data) return

      try {
        await updateMedicalRecordByVisit(visitId, soapData)
        await refetch()
        toast.success("SOAP berhasil disimpan!")
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        toast.error(`Gagal menyimpan SOAP: ${errorMessage}`)
        throw err
      }
    },
    [visitId, coreQuery.data, refetch]
  )

  // Optimistic update for record
  const updateRecord = useCallback(
    (updates: Partial<MedicalRecordCoreData["medicalRecord"]>) => {
      if (!coreQuery.data) return

      queryClient.setQueryData(medicalRecordKeys.core(visitId), {
        ...coreQuery.data,
        medicalRecord: {
          ...coreQuery.data.medicalRecord,
          ...updates,
        },
      })
    },
    [coreQuery.data, queryClient, visitId]
  )

  const clearError = useCallback(() => {
    // Errors are managed by React Query, this is a no-op for compatibility
  }, [])

  return {
    // Data
    coreData: coreQuery.data ?? null,
    isLocked: coreQuery.data?.medicalRecord.isLocked ?? false,
    isDraft: coreQuery.data?.medicalRecord.isDraft ?? true,

    // Loading states
    isLoading: coreQuery.isLoading,
    isSaving: false, // Managed by mutations in the future
    isLocking: false, // Managed by mutations in the future

    // Error handling
    error,
    clearError,

    // Operations
    refetch,
    saveSOAP,
    saveDraft,
    lockRecord,
    unlockRecord,
    updateRecord,
  }
}
