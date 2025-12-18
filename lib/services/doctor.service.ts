/**
 * Doctor Service
 * Handle doctor-related API operations
 */

import axios from "axios"
import { ResponseApi } from "@/types/api"
import { Doctor } from "@/types/user"
import { ApiServiceError, handleApiError } from "./api.service"

/**
 * Fetch all doctors from the API
 * @returns Promise<Doctor[]>
 */
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const response = await axios.get<ResponseApi<Doctor[]>>("/api/doctors")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing doctors data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getDoctors service:", error)
    handleApiError(error)
  }
}
