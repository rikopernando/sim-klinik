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

import { useCallback, useState } from "react"
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
  hasUnsavedChanges: boolean

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
    staleTime: 5 * 60 * 1000,
  })

  // State
  const [isSaving, setIsSaving] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Error handling
  const error = coreQuery.error ? getErrorMessage(coreQuery.error) : null

  // Refetch core data
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.core(visitId) })
  }, [queryClient, visitId])

  // Save draft — persists current SOAP content from the cache (kept in sync by updateRecord)
  const saveDraft = useCallback(async () => {
    if (!coreQuery.data) return

    try {
      setIsSaving(true)
      const { soapSubjective, soapObjective, soapAssessment, soapPlan } =
        coreQuery.data.medicalRecord
      await updateMedicalRecordByVisit(visitId, {
        isDraft: true,
        soapSubjective: soapSubjective ?? undefined,
        soapObjective: soapObjective ?? undefined,
        soapAssessment: soapAssessment ?? undefined,
        soapPlan: soapPlan ?? undefined,
      })
      await refetch()
      setHasUnsavedChanges(false)
      toast.success("Draft berhasil disimpan!")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      toast.error(`Gagal menyimpan draft: ${errorMessage}`)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [visitId, coreQuery.data, refetch])

  // Lock record — saves SOAP first, then locks
  const lockRecord = useCallback(
    async (billingAdjustment?: number, adjustmentNote?: string) => {
      if (!coreQuery.data) return

      try {
        setIsLocking(true)

        // Flush SOAP content from cache to server before locking
        const { soapSubjective, soapObjective, soapAssessment, soapPlan } =
          coreQuery.data.medicalRecord
        await updateMedicalRecordByVisit(visitId, {
          soapSubjective: soapSubjective ?? undefined,
          soapObjective: soapObjective ?? undefined,
          soapAssessment: soapAssessment ?? undefined,
          soapPlan: soapPlan ?? undefined,
        })

        await lockMedicalRecord({
          id: coreQuery.data.medicalRecord.id,
          billingAdjustment,
          adjustmentNote,
        })
        await refetch()
        setHasUnsavedChanges(false)
        toast.success("Rekam medis berhasil dikunci!")
      } catch (err) {
        toast.error("Gagal mengunci rekam medis")
        throw err
      } finally {
        setIsLocking(false)
      }
    },
    [coreQuery.data, refetch, visitId]
  )

  // Unlock record
  const unlockRecord = useCallback(async () => {
    if (!coreQuery.data) return

    try {
      setIsLocking(true)
      await unlockMedicalRecord(coreQuery.data.medicalRecord.id)
      await refetch()
      toast.success("Rekam medis berhasil dibuka!")
    } catch (err) {
      toast.error("Gagal membuka kunci rekam medis")
      throw err
    } finally {
      setIsLocking(false)
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

  // Optimistic update for record — marks as having unsaved changes
  const updateRecord = useCallback(
    (updates: Partial<MedicalRecordCoreData["medicalRecord"]>) => {
      if (!coreQuery.data) return

      setHasUnsavedChanges(true)
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
    hasUnsavedChanges,

    // Loading states
    isLoading: coreQuery.isLoading,
    isSaving,
    isLocking,

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
