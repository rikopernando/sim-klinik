/**
 * Inpatient List Hook
 * Fetches and manages inpatient patient list
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

import type { InpatientPatient, InpatientFilters } from "@/types/inpatient"
import { fetchInpatientPatients } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"

export function useInpatientList(filters?: InpatientFilters) {
  const [patients, setPatients] = useState<InpatientPatient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadPatients = useCallback(async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)

    try {
      const data = await fetchInpatientPatients(filters)

      if (!abortController.signal.aborted) {
        setPatients(data)
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error("Error fetching inpatient patients:", error)
        toast.error(getErrorMessage(error))
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [filters])

  useEffect(() => {
    loadPatients()

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadPatients])

  const refresh = useCallback(() => {
    loadPatients()
  }, [loadPatients])

  return {
    patients,
    isLoading,
    refresh,
  }
}
