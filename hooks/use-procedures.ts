/**
 * Hook for fetching procedures by visit ID
 * Uses React Query for caching and automatic refetching
 */

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { getProceduresByVisit } from "@/lib/services/medical-record.service"
import { type Procedure } from "@/types/medical-record"

export const proceduresKeys = {
  all: ["procedures"] as const,
  byVisit: (visitId: string) => [...proceduresKeys.all, visitId] as const,
}

interface UseProceduresOptions {
  visitId: string
  enabled?: boolean
}

interface UseProceduresReturn {
  procedures: Procedure[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProcedures({
  visitId,
  enabled = true,
}: UseProceduresOptions): UseProceduresReturn {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: proceduresKeys.byVisit(visitId),
    queryFn: () => getProceduresByVisit(visitId),
    enabled: !!visitId && enabled,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: proceduresKeys.byVisit(visitId) })
  }, [queryClient, visitId])

  return {
    procedures: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
