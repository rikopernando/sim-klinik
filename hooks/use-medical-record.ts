/**
 * Custom hook for managing medical record data and operations
 * Uses React Query for efficient data fetching and caching
 */

import { useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getMedicalRecordByVisit,
  getDiagnosesByVisit,
  getProceduresByVisit,
  getPrescriptionsByVisit,
  updateMedicalRecordByVisit,
  lockMedicalRecord,
  unlockMedicalRecord,
} from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import {
  type MedicalRecordData,
  type MedicalRecordCoreData,
  type Diagnosis,
  type Procedure,
  type Prescription,
} from "@/types/medical-record"
import { toast } from "sonner"

// Query keys for cache management
export const medicalRecordKeys = {
  all: ["medical-records"] as const,
  core: (visitId: string) => [...medicalRecordKeys.all, "core", visitId] as const,
  diagnoses: (visitId: string) => [...medicalRecordKeys.all, "diagnoses", visitId] as const,
  procedures: (visitId: string) => [...medicalRecordKeys.all, "procedures", visitId] as const,
  prescriptions: (visitId: string) => [...medicalRecordKeys.all, "prescriptions", visitId] as const,
}

interface UseMedicalRecordOptions {
  visitId: string
}

interface UseMedicalRecordReturn {
  // Data
  recordData: MedicalRecordData | null
  coreData: MedicalRecordCoreData | null
  diagnoses: Diagnosis[]
  procedures: Procedure[]
  prescriptions: Prescription[]
  isLocked: boolean
  isDraft: boolean

  // Loading states
  isLoading: boolean
  isCoreLoading: boolean
  isDiagnosesLoading: boolean
  isProceduresLoading: boolean
  isPrescriptionsLoading: boolean
  isSaving: boolean
  isLocking: boolean

  // Error handling
  error: string | null
  clearError: () => void

  // Operations
  loadMedicalRecord: () => Promise<void>
  saveSOAP: (soapData: {
    soapSubjective?: string
    soapObjective?: string
    soapAssessment?: string
    soapPlan?: string
  }) => Promise<void>
  saveDraft: () => Promise<void>
  lockRecord: (billingAdjustment?: number, adjustmentNote?: string) => Promise<void>
  unlockRecord: () => Promise<void>
  updateRecord: (updates: Partial<MedicalRecordData["medicalRecord"]>) => void

  // Refetch functions for individual resources
  refetchDiagnoses: () => Promise<void>
  refetchProcedures: () => Promise<void>
  refetchPrescriptions: () => Promise<void>
}

export function useMedicalRecord({ visitId }: UseMedicalRecordOptions): UseMedicalRecordReturn {
  const queryClient = useQueryClient()

  // Fetch core medical record and visit info
  const coreQuery = useQuery({
    queryKey: medicalRecordKeys.core(visitId),
    queryFn: () => getMedicalRecordByVisit(visitId),
    enabled: !!visitId,
  })

  // Fetch diagnoses
  const diagnosesQuery = useQuery({
    queryKey: medicalRecordKeys.diagnoses(visitId),
    queryFn: () => getDiagnosesByVisit(visitId),
    enabled: !!visitId,
  })

  // Fetch procedures
  const proceduresQuery = useQuery({
    queryKey: medicalRecordKeys.procedures(visitId),
    queryFn: () => getProceduresByVisit(visitId),
    enabled: !!visitId,
  })

  // Fetch prescriptions
  const prescriptionsQuery = useQuery({
    queryKey: medicalRecordKeys.prescriptions(visitId),
    queryFn: () => getPrescriptionsByVisit(visitId),
    enabled: !!visitId,
  })

  // Combined loading state
  const isLoading =
    coreQuery.isLoading ||
    diagnosesQuery.isLoading ||
    proceduresQuery.isLoading ||
    prescriptionsQuery.isLoading

  // Combined error
  const error =
    coreQuery.error || diagnosesQuery.error || proceduresQuery.error || prescriptionsQuery.error
      ? getErrorMessage(
          coreQuery.error ||
            diagnosesQuery.error ||
            proceduresQuery.error ||
            prescriptionsQuery.error
        )
      : null

  // Compose full record data for backward compatibility
  const recordData: MedicalRecordData | null =
    coreQuery.data && diagnosesQuery.data && proceduresQuery.data && prescriptionsQuery.data
      ? {
          medicalRecord: coreQuery.data.medicalRecord,
          visit: coreQuery.data.visit,
          diagnoses: diagnosesQuery.data,
          procedures: proceduresQuery.data,
          prescriptions: prescriptionsQuery.data,
        }
      : null

  // Invalidate all queries for this visit
  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.core(visitId) }),
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.diagnoses(visitId) }),
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.procedures(visitId) }),
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.prescriptions(visitId) }),
    ])
  }, [queryClient, visitId])

  // Refetch functions
  const refetchDiagnoses = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.diagnoses(visitId) })
  }, [queryClient, visitId])

  const refetchProcedures = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.procedures(visitId) })
  }, [queryClient, visitId])

  const refetchPrescriptions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.prescriptions(visitId) })
  }, [queryClient, visitId])

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!recordData) return

    try {
      await updateMedicalRecordByVisit(visitId, { isDraft: true })
      await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.core(visitId) })
      toast.success("Draft berhasil disimpan!")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      toast.error(`Gagal menyimpan draft: ${errorMessage}`)
      throw err
    }
  }, [visitId, recordData, queryClient])

  // Lock record
  const lockRecord = useCallback(
    async (billingAdjustment?: number, adjustmentNote?: string) => {
      if (!recordData) return

      try {
        await lockMedicalRecord({
          id: recordData.medicalRecord.id,
          billingAdjustment,
          adjustmentNote,
        })
        await invalidateAll()
        toast.success("Rekam medis berhasil dikunci!")
      } catch (err) {
        toast.error("Gagal mengunci rekam medis")
        throw err
      }
    },
    [recordData, invalidateAll]
  )

  // Unlock record
  const unlockRecord = useCallback(async () => {
    if (!recordData) return

    try {
      await unlockMedicalRecord(recordData.medicalRecord.id)
      await invalidateAll()
      toast.success("Rekam medis berhasil dibuka!")
    } catch (err) {
      toast.error("Gagal membuka kunci rekam medis")
      throw err
    }
  }, [recordData, invalidateAll])

  // Save SOAP
  const saveSOAP = useCallback(
    async (soapData: {
      soapSubjective?: string
      soapObjective?: string
      soapAssessment?: string
      soapPlan?: string
    }) => {
      if (!recordData) return

      try {
        await updateMedicalRecordByVisit(visitId, soapData)
        await queryClient.invalidateQueries({ queryKey: medicalRecordKeys.core(visitId) })
        toast.success("SOAP berhasil disimpan!")
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        toast.error(`Gagal menyimpan SOAP: ${errorMessage}`)
        throw err
      }
    },
    [visitId, recordData, queryClient]
  )

  // Optimistic update for record
  const updateRecord = useCallback(
    (updates: Partial<MedicalRecordData["medicalRecord"]>) => {
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
    recordData,
    coreData: coreQuery.data ?? null,
    diagnoses: diagnosesQuery.data ?? [],
    procedures: proceduresQuery.data ?? [],
    prescriptions: prescriptionsQuery.data ?? [],
    isLocked: coreQuery.data?.medicalRecord.isLocked ?? false,
    isDraft: coreQuery.data?.medicalRecord.isDraft ?? true,

    // Loading states
    isLoading,
    isCoreLoading: coreQuery.isLoading,
    isDiagnosesLoading: diagnosesQuery.isLoading,
    isProceduresLoading: proceduresQuery.isLoading,
    isPrescriptionsLoading: prescriptionsQuery.isLoading,
    isSaving: false, // Managed by mutations in the future
    isLocking: false, // Managed by mutations in the future

    // Error handling
    error,
    clearError,

    // Operations
    loadMedicalRecord: invalidateAll,
    saveSOAP,
    saveDraft,
    lockRecord,
    unlockRecord,
    updateRecord,

    // Refetch functions
    refetchDiagnoses,
    refetchProcedures,
    refetchPrescriptions,
  }
}
