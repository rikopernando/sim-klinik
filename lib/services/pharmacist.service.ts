/**
 * Pharmacist Service
 * Handle Pharmacist-related API operations
 */

import axios from "axios"

export interface Pharmacist {
  id: string
  name: string
  email: string
}

interface GetPharmacistsResponse {
  pharmacists: Pharmacist[]
}

/**
 * Fetch all Pharmacists from the API
 * @returns Promise<Pharmacist[]>
 */
export async function getPharmacists(): Promise<Pharmacist[]> {
  try {
    const { data } = await axios.get<GetPharmacistsResponse>("/api/pharmacists")
    console.log({ data })
    return data.pharmacists || []
  } catch (error) {
    console.error("Error in getPharmacists service:", error)

    // Re-throw with more context
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message || "Failed to fetch Pharmacists")
    }

    throw error
  }
}
