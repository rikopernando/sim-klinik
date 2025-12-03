/**
 * Custom hook for medical record history
 * Handles fetching patient's medical record history
 */

import { useState, useEffect, useCallback } from "react"

interface MedicalRecordHistoryData {
  patient: {
    id: number
    name: string
    mrNumber: string
    allergies: string | null
  }
  history: Array<{
    medicalRecord: {
      id: number
      isLocked: boolean
      soapSubjective: string | null
      soapObjective: string | null
      soapAssessment: string | null
      soapPlan: string | null
      createdAt: Date
    }
    visit: {
      visitNumber: string
    }
    diagnoses: Array<{
      id: number
      icd10Code: string
      description: string
      diagnosisType: string
    }>
    procedures: Array<{
      id: number
      icd9Code: string
      description: string
    }>
    prescriptions: Array<{
      prescription: {
        id: number
        dosage: string
        frequency: string
        duration: string | null
        instructions: string | null
        isFulfilled: boolean
      }
      drug: {
        name: string
      } | null
    }>
  }>
}

interface UseMedicalRecordHistoryOptions {
  patientId: number | null
  enabled: boolean
}

export function useMedicalRecordHistory({ patientId, enabled }: UseMedicalRecordHistoryOptions) {
  const [history, setHistory] = useState<MedicalRecordHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!patientId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/medical-records/history?patientId=${patientId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat riwayat rekam medis")
      }

      setHistory(data.data)
    } catch (err) {
      console.error("Fetch history error:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    if (enabled && patientId) {
      fetchHistory()
    }
  }, [enabled, patientId, fetchHistory])

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
  }
}
