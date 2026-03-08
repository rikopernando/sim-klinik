/**
 * Compound Recipe Service
 * Client-side service for compound recipe (obat racik) operations
 */

import axios from "axios"
import { ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"
import type {
  CompoundRecipe,
  CompoundRecipeWithCreator,
  CreateCompoundRecipeInput,
  UpdateCompoundRecipeInput,
} from "@/types/compound-recipe"

interface CompoundRecipesResponse {
  data: CompoundRecipeWithCreator[]
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

/**
 * Get paginated compound recipes with optional filters
 */
export async function getCompoundRecipes(params?: {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}): Promise<CompoundRecipesResponse> {
  try {
    const response = await axios.get<ResponseApi<CompoundRecipeWithCreator[]>>(
      "/api/master-data/compound-recipes",
      { params }
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return {
      data: response.data.data,
      meta: response.data.meta || {
        page: 1,
        limit: 10,
        total: response.data.data.length,
        hasMore: false,
      },
    }
  } catch (error) {
    console.error("Error in getCompoundRecipes service:", error)
    handleApiError(error)
  }
}

/**
 * Get active compound recipes for prescription selection
 * Returns only active recipes with simplified data
 */
export async function getActiveCompoundRecipes(
  search?: string
): Promise<CompoundRecipeWithCreator[]> {
  try {
    const response = await axios.get<ResponseApi<CompoundRecipeWithCreator[]>>(
      "/api/master-data/compound-recipes",
      {
        params: {
          search,
          isActive: true,
          limit: 50,
        },
      }
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getActiveCompoundRecipes service:", error)
    handleApiError(error)
  }
}

/**
 * Get a compound recipe by ID
 */
export async function getCompoundRecipe(id: string): Promise<CompoundRecipeWithCreator> {
  try {
    const response = await axios.get<ResponseApi<CompoundRecipeWithCreator>>(
      `/api/master-data/compound-recipes/${id}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getCompoundRecipe service:", error)
    handleApiError(error)
  }
}

/**
 * Create a new compound recipe
 */
export async function createCompoundRecipe(
  data: CreateCompoundRecipeInput
): Promise<CompoundRecipe> {
  try {
    const response = await axios.post<ResponseApi<CompoundRecipe>>(
      "/api/master-data/compound-recipes",
      data
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in createCompoundRecipe service:", error)
    handleApiError(error)
  }
}

/**
 * Update a compound recipe
 */
export async function updateCompoundRecipe(
  id: string,
  data: UpdateCompoundRecipeInput
): Promise<CompoundRecipe> {
  try {
    const response = await axios.patch<ResponseApi<CompoundRecipe>>(
      `/api/master-data/compound-recipes/${id}`,
      data
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in updateCompoundRecipe service:", error)
    handleApiError(error)
  }
}

/**
 * Delete a compound recipe (soft delete)
 */
export async function deleteCompoundRecipe(id: string): Promise<void> {
  try {
    await axios.delete(`/api/master-data/compound-recipes/${id}`)
  } catch (error) {
    console.error("Error in deleteCompoundRecipe service:", error)
    handleApiError(error)
  }
}

/**
 * Toggle compound recipe active status
 */
export async function toggleCompoundRecipeStatus(
  id: string,
  isActive: boolean
): Promise<CompoundRecipe> {
  try {
    const response = await axios.patch<ResponseApi<CompoundRecipe>>(
      `/api/master-data/compound-recipes/${id}`,
      { isActive }
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in toggleCompoundRecipeStatus service:", error)
    handleApiError(error)
  }
}
