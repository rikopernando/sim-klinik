/**
 * Hook for fetching prescriptions by visit ID
 * Uses React Query for caching and automatic refetching
 */

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { getPrescriptionsByVisit } from "@/lib/services/medical-record.service"
import { type Prescription } from "@/types/medical-record"

export const prescriptionsKeys = {
  all: ["prescriptions"] as const,
  byVisit: (visitId: string) => [...prescriptionsKeys.all, visitId] as const,
}

interface UsePrescriptionsOptions {
  visitId: string
  enabled?: boolean
}

interface UsePrescriptionsReturn {
  prescriptions: Prescription[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function usePrescriptions({
  visitId,
  enabled = true,
}: UsePrescriptionsOptions): UsePrescriptionsReturn {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: prescriptionsKeys.byVisit(visitId),
    queryFn: () => getPrescriptionsByVisit(visitId),
    enabled: !!visitId && enabled,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: prescriptionsKeys.byVisit(visitId) })
  }, [queryClient, visitId])

  return {
    prescriptions: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
