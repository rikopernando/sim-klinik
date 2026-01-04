/**
 * Custom hook for managing medical record data and operations
 */

import { useState, useEffect, useCallback, useRef } from "react"
import {
  getMedicalRecordByVisit,
  updateMedicalRecordByVisit,
  lockMedicalRecord,
  unlockMedicalRecord,
} from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type MedicalRecordData } from "@/types/medical-record"
import { toast } from "sonner"

interface UseMedicalRecordOptions {
  visitId: string
}

interface UseMedicalRecordReturn {
  // Data
  recordData: MedicalRecordData | null
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
}

export function useMedicalRecord({ visitId }: UseMedicalRecordOptions): UseMedicalRecordReturn {
  const [recordData, setRecordData] = useState<MedicalRecordData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref to prevent double execution
  const isInitializedRef = useRef(false)

  // Internal function to fetch data
  const fetchMedicalRecord = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const data = await getMedicalRecordByVisit(visitId)
      setRecordData(data)
      return data
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [visitId])

  // Initial load with guard against double execution
  const loadMedicalRecord = useCallback(async () => {
    // Prevent double execution in React StrictMode
    if (isInitializedRef.current) {
      return
    }

    await fetchMedicalRecord()
    isInitializedRef.current = true
  }, [fetchMedicalRecord])

  // Reload function for updates
  const reloadMedicalRecord = useCallback(async () => {
    await fetchMedicalRecord()
  }, [fetchMedicalRecord])

  useEffect(() => {
    loadMedicalRecord()
  }, [loadMedicalRecord])

  const saveDraft = useCallback(async () => {
    if (!recordData) return

    try {
      setIsSaving(true)
      setError(null)

      await updateMedicalRecordByVisit(visitId, {
        isDraft: true,
      })

      // Reload to get updated data
      await reloadMedicalRecord()

      // Show success toast
      toast.success("Draft berhasil disimpan!")
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      // Show error toast
      toast.error(`Gagal menyimpan draft: ${errorMessage}`)

      throw err
    } finally {
      setIsSaving(false)
    }
  }, [visitId, recordData, reloadMedicalRecord])

  const lockRecord = useCallback(
    async (billingAdjustment?: number, adjustmentNote?: string) => {
      if (!recordData) return

      try {
        setIsLocking(true)
        setError(null)

        await lockMedicalRecord({
          id: recordData.medicalRecord.id,
          billingAdjustment,
          adjustmentNote,
        })

        // Reload to get updated data
        await reloadMedicalRecord()
        // Show success toast
        toast.success("Rekam medis berhasil dikunci!")
      } catch (err) {
        setError(getErrorMessage(err))
        // Show error toast
        toast.error(`Gagal mengunci rekam medis`)
      } finally {
        setIsLocking(false)
      }
    },
    [recordData, reloadMedicalRecord]
  )

  const unlockRecord = useCallback(async () => {
    if (!recordData) return

    try {
      setIsLocking(true)
      setError(null)

      await unlockMedicalRecord(recordData.medicalRecord.id)

      // Reload to get updated data
      await reloadMedicalRecord()
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setIsLocking(false)
    }
  }, [recordData, reloadMedicalRecord])

  const saveSOAP = useCallback(
    async (soapData: {
      soapSubjective?: string
      soapObjective?: string
      soapAssessment?: string
      soapPlan?: string
    }) => {
      if (!recordData) return

      try {
        setError(null)
        await updateMedicalRecordByVisit(visitId, soapData)
        // Show success toast
        toast.success("SOAP berhasil disimpan!")
        await reloadMedicalRecord()
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setError(errorMessage)
        // Show error toast
        toast.error(`Gagal menyimpan draft: ${errorMessage}`)
        throw err
      }
    },
    [visitId, recordData, reloadMedicalRecord]
  )

  const updateRecord = useCallback(
    (updates: Partial<MedicalRecordData["medicalRecord"]>) => {
      if (!recordData) return

      setRecordData({
        ...recordData,
        medicalRecord: {
          ...recordData.medicalRecord,
          ...updates,
        },
      })
    },
    [recordData]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    recordData,
    isLocked: recordData?.medicalRecord.isLocked ?? false,
    isDraft: recordData?.medicalRecord.isDraft ?? true,

    // Loading states
    isLoading,
    isSaving,
    isLocking,

    // Error handling
    error,
    clearError,

    // Operations
    loadMedicalRecord: reloadMedicalRecord, // Expose reload for tabs to use
    saveSOAP,
    saveDraft,
    lockRecord,
    unlockRecord,
    updateRecord,
  }
}
