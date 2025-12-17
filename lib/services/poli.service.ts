/**
 * Poli Service
 * Handle poli/poliklinik-related API operations
 */

import axios from "axios"

import { ResponseApi, Meta } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"
import { ResultPoli, PayloadPoli } from "@/types/poli"

/**
 * Fetch all active polis from the API
 * @returns Promise<Poli[]>
 */
export async function getPolis(opts?: {
  page?: number
  limit?: number
  search?: string
  includeInactive?: boolean
}): Promise<{ data: ResultPoli[]; meta?: Meta } | undefined> {
  try {
    const params: Record<string, string | number | boolean> = {}
    if (opts?.page) params.page = opts.page
    if (opts?.limit) params.limit = opts.limit
    if (opts?.search) params.search = opts.search
    if (opts?.includeInactive) params.includeInactive = opts.includeInactive

    const response = await axios.get<ResponseApi<ResultPoli[]>>("/api/polis", { params })
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing polis data")
    }

    return { data: response.data.data, meta: response.data.meta }
  } catch (error) {
    console.error("Error in getPolis service:", error)
    handleApiError(error)
  }
}

export async function createPoli(payload: PayloadPoli): Promise<ResultPoli> {
  try {
    const response = await axios.post<ResponseApi<ResultPoli>>("/api/polis", payload)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing created poli data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in createPoli service:", error)
    handleApiError(error)
  }
}

export async function updatePoli(id: string, payload: Partial<PayloadPoli>): Promise<ResultPoli> {
  try {
    const response = await axios.patch<ResponseApi<ResultPoli>>(`/api/polis/${id}`, payload)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing updated poli data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in updatePoli service:", error)
    handleApiError(error)
  }
}

export async function deletePoli(id: string): Promise<void> {
  try {
    await axios.delete<ResponseApi<null>>(`/api/polis/${id}`)
  } catch (error) {
    console.error("Error in deletePoli service:", error)
    handleApiError(error)
  }
}
