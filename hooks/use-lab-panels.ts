import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLabPanels, createLabPanel, updateLabPanel } from "@/lib/services/lab-panel.service"
import type { LabPanelFilters, CreateLabPanelInput, UpdateLabPanelInput } from "@/types/lab-panel"

const QUERY_KEY = "lab-panels"

export function useLabPanels(filters: LabPanelFilters = {}) {
  const query = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getLabPanels(filters),
  })

  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? { page: 1, limit: 20, total: 0, hasMore: false },
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useCreateLabPanel() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: CreateLabPanelInput) => createLabPanel(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { create: mutation.mutateAsync, isCreating: mutation.isPending }
}

export function useUpdateLabPanel() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabPanelInput }) =>
      updateLabPanel(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { update: mutation.mutateAsync, isUpdating: mutation.isPending }
}
