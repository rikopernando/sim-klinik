import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDrugs, createDrug, updateDrug } from "@/lib/services/drug.service"
import type { InventoryItemFilters, CreateDrugInput, UpdateDrugInput } from "@/types/drug"

const QUERY_KEY = "drugs"

export function useDrugs(filters: InventoryItemFilters = {}) {
  const query = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getDrugs(filters),
    staleTime: 10 * 60 * 1000,
  })

  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0, hasMore: false },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCreateDrug() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: CreateDrugInput) => createDrug(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { create: mutation.mutateAsync, isCreating: mutation.isPending }
}

export function useUpdateDrug() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDrugInput }) => updateDrug(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { update: mutation.mutateAsync, isUpdating: mutation.isPending }
}
