/**
 * Pharmacist Service
 * Handle Pharmacist-related API operations
 */

import axios from "axios"

import { ResponseApi } from "@/types/api"
import { Pharmacist } from "@/types/user"
import { ApiServiceError, handleApiError } from "./api.service"

/**
 * Fetch all Pharmacists from the API
 * @returns Promise<Pharmacist[]>
 */
export async function getPharmacists(): Promise<Pharmacist[]> {
  try {
    const response = await axios.get<ResponseApi<Pharmacist[]>>("/api/pharmacists")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing pharmacists data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getPharmacists service:", error)
    handleApiError(error)
  }
}
