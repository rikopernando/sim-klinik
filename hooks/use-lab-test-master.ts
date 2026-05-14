import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLabTests, createLabTest, updateLabTest } from "@/lib/services/lab-test.service"
import type { LabTestFilters, CreateLabTestInput, UpdateLabTestInput } from "@/types/lab-test"

const QUERY_KEY = "lab-test-master"

export function useLabTestMaster(filters: LabTestFilters = {}) {
  const query = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getLabTests(filters),
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

export function useCreateLabTestMaster() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: CreateLabTestInput) => createLabTest(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { create: mutation.mutateAsync, isCreating: mutation.isPending }
}

export function useUpdateLabTestMaster() {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabTestInput }) =>
      updateLabTest(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
  return { update: mutation.mutateAsync, isUpdating: mutation.isPending }
}
