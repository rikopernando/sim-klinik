/**
 * Doctor Service
 * Handle doctor-related API operations
 */

import axios from "axios"

export interface Doctor {
  id: string
  name: string
  email: string
}

interface GetDoctorsResponse {
  doctors: Doctor[]
}

/**
 * Fetch all doctors from the API
 * @returns Promise<Doctor[]>
 */
export async function getDoctors(): Promise<Doctor[]> {
  try {
    const { data } = await axios.get<GetDoctorsResponse>("/api/doctors")
    return data.doctors || []
  } catch (error) {
    console.error("Error in getDoctors service:", error)

    // Re-throw with more context
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message || "Failed to fetch doctors")
    }

    throw error
  }
}
