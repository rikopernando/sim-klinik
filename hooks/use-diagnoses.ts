/**
 * Hook for fetching diagnoses by visit ID
 * Uses React Query for caching and automatic refetching
 */

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { getDiagnosesByVisit } from "@/lib/services/medical-record.service"
import { type Diagnosis } from "@/types/medical-record"

export const diagnosesKeys = {
  all: ["diagnoses"] as const,
  byVisit: (visitId: string) => [...diagnosesKeys.all, visitId] as const,
}

interface UseDiagnosesOptions {
  visitId: string
  enabled?: boolean
}

interface UseDiagnosesReturn {
  diagnoses: Diagnosis[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDiagnoses({ visitId, enabled = true }: UseDiagnosesOptions): UseDiagnosesReturn {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: diagnosesKeys.byVisit(visitId),
    queryFn: () => getDiagnosesByVisit(visitId),
    enabled: !!visitId && enabled,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: diagnosesKeys.byVisit(visitId) })
  }, [queryClient, visitId])

  return {
    diagnoses: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
