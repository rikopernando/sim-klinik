/**
 * Custom hook for fetching and managing patient detail data
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import { fetchPatientDetail } from "@/lib/services/inpatient.service"
import { PatientDetail } from "@/types/inpatient"
import { getErrorMessage } from "@/lib/utils/error"

export function usePatientDetail(visitId: string) {
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadPatientDetail = useCallback(async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    try {
      setIsLoading(true)
      const data = await fetchPatientDetail(visitId)
      if (!abortController.signal.aborted) {
        setPatientDetail(data)
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error("Error fetching patient detail:", err)
        toast.error(getErrorMessage(err))
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [visitId])

  useEffect(() => {
    if (visitId) {
      loadPatientDetail()
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [visitId, loadPatientDetail])

  const refresh = useCallback(() => {
    loadPatientDetail()
  }, [loadPatientDetail])

  return {
    patientDetail,
    isLoading,
    refresh,
  }
}
