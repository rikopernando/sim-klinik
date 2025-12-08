/**
 * Poli Service
 * Handle poli/poliklinik-related API operations
 */

import axios from "axios"

import { ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"
import { Poli } from "@/types/poli"

/**
 * Fetch all active polis from the API
 * @returns Promise<Poli[]>
 */
export async function getPolis(): Promise<Poli[]> {
  try {
    const response = await axios.get<ResponseApi<Poli[]>>("/api/polis")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing polis data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getPolis service:", error)
    handleApiError(error)
  }
}
