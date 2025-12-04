/**
 * Poli Service
 * Handle poli/poliklinik-related API operations
 */

import axios from "axios"

export interface Poli {
  id: string
  name: string
  code: string
  description: string | null
  isActive: string
}

interface GetPolisResponse {
  success: boolean
  data: Poli[]
}

/**
 * Fetch all active polis from the API
 * @returns Promise<Poli[]>
 */
export async function getPolis(): Promise<Poli[]> {
  try {
    const { data } = await axios.get<GetPolisResponse>("/api/polis")
    return data.data || []
  } catch (error) {
    console.error("Error in getPolis service:", error)

    // Re-throw with more context
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message || "Failed to fetch polis")
    }

    throw error
  }
}

/**
 * Get poli by ID
 * @param id - Poli ID
 * @returns Promise<Poli | null>
 */
export async function getPoliById(id: string): Promise<Poli | null> {
  try {
    const polis = await getPolis()
    return polis.find((p) => p.id === id) || null
  } catch (error) {
    console.error("Error in getPoliById service:", error)
    throw error
  }
}
