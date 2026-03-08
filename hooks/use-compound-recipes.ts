/**
 * Compound Recipes Hooks
 * React Query hooks for compound recipe (obat racik) operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import {
  getCompoundRecipes,
  getCompoundRecipe,
  getActiveCompoundRecipes,
  createCompoundRecipe,
  updateCompoundRecipe,
  deleteCompoundRecipe,
  toggleCompoundRecipeStatus,
} from "@/lib/services/compound-recipe.service"
import type {
  CompoundRecipeWithCreator,
  CompoundRecipeFilters,
  CreateCompoundRecipeInput,
  UpdateCompoundRecipeInput,
} from "@/types/compound-recipe"

// Query keys
export const compoundRecipeKeys = {
  all: ["compound-recipes"] as const,
  lists: () => [...compoundRecipeKeys.all, "list"] as const,
  list: (filters: CompoundRecipeFilters & { page?: number; limit?: number }) =>
    [...compoundRecipeKeys.lists(), filters] as const,
  active: (search?: string) => [...compoundRecipeKeys.all, "active", search] as const,
  details: () => [...compoundRecipeKeys.all, "detail"] as const,
  detail: (id: string) => [...compoundRecipeKeys.details(), id] as const,
}

interface UseCompoundRecipesOptions {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
  enabled?: boolean
}

interface UseCompoundRecipesReturn {
  recipes: CompoundRecipeWithCreator[]
  isLoading: boolean
  error: Error | null
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  refetch: () => Promise<void>
}

/**
 * Hook for fetching paginated compound recipes with filters
 */
export function useCompoundRecipes({
  search,
  isActive,
  page = 1,
  limit = 10,
  enabled = true,
}: UseCompoundRecipesOptions = {}): UseCompoundRecipesReturn {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: compoundRecipeKeys.list({ search, isActive, page, limit }),
    queryFn: () => getCompoundRecipes({ search, isActive, page, limit }),
    enabled,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.lists() })
  }, [queryClient])

  return {
    recipes: data?.data ?? [],
    isLoading,
    error: error as Error | null,
    meta: data?.meta ?? { page: 1, limit: 10, total: 0, hasMore: false },
    refetch,
  }
}

interface UseActiveCompoundRecipesOptions {
  search?: string
  enabled?: boolean
}

/**
 * Hook for fetching active compound recipes (for prescription selection)
 */
export function useActiveCompoundRecipes({
  search,
  enabled = true,
}: UseActiveCompoundRecipesOptions = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: compoundRecipeKeys.active(search),
    queryFn: () => getActiveCompoundRecipes(search),
    enabled,
  })

  return {
    recipes: data ?? [],
    isLoading,
    error: error as Error | null,
  }
}

interface UseCompoundRecipeOptions {
  id: string
  enabled?: boolean
}

/**
 * Hook for fetching a single compound recipe by ID
 */
export function useCompoundRecipe({ id, enabled = true }: UseCompoundRecipeOptions) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: compoundRecipeKeys.detail(id),
    queryFn: () => getCompoundRecipe(id),
    enabled: !!id && enabled,
  })

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.detail(id) })
  }, [queryClient, id])

  return {
    recipe: data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook for creating a compound recipe
 */
export function useCreateCompoundRecipe() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: CreateCompoundRecipeInput) => createCompoundRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.lists() })
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return {
    createRecipe: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error,
    reset: () => {
      mutation.reset()
      setError(null)
    },
  }
}

/**
 * Hook for updating a compound recipe
 */
export function useUpdateCompoundRecipe() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompoundRecipeInput }) =>
      updateCompoundRecipe(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.detail(variables.id) })
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return {
    updateRecipe: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error,
    reset: () => {
      mutation.reset()
      setError(null)
    },
  }
}

/**
 * Hook for deleting a compound recipe
 */
export function useDeleteCompoundRecipe() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (id: string) => deleteCompoundRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.lists() })
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return {
    deleteRecipe: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error,
    reset: () => {
      mutation.reset()
      setError(null)
    },
  }
}

/**
 * Hook for toggling compound recipe active status
 */
export function useToggleCompoundRecipeStatus() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCompoundRecipeStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: compoundRecipeKeys.detail(variables.id) })
      setError(null)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return {
    toggleStatus: mutation.mutateAsync,
    isToggling: mutation.isPending,
    error,
    reset: () => {
      mutation.reset()
      setError(null)
    },
  }
}
