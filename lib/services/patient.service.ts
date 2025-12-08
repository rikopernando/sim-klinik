/**
 * Patient Service - Handles all patient-related API calls
 */

import axios from "axios"
import { type PatientFormData, type RegisteredPatient } from "@/types/registration"
import { type ResponseApi, type Meta } from "@/types/api"
import { handleApiError, ApiServiceError } from "./api.service"

/**
 * Search results with pagination metadata
 */
export interface SearchPatientsResult {
  patients: Partial<RegisteredPatient>[]
  meta?: Meta
}

/**
 * Search patients by query (NIK, MR Number, or Name)
 * @param query - Search query string (minimum 2 characters)
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20, max: 100)
 * @returns Search results with pagination metadata
 */
export async function searchPatients(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchPatientsResult> {
  if (!query || query.trim().length < 2) {
    return { patients: [], meta: undefined }
  }

  try {
    const response = await axios.get<ResponseApi<Partial<RegisteredPatient>[]>>(
      "/api/patients/search",
      {
        params: { q: query.trim(), page, limit },
      }
    )

    return {
      patients: response.data.data || [],
      meta: response.data.meta,
    }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Register a new patient
 * @param data - Patient form data
 * @returns Newly registered patient
 */
export async function registerPatient(data: PatientFormData): Promise<RegisteredPatient> {
  try {
    // Convert Date to ISO string for API
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
    }

    const response = await axios.post<ResponseApi<RegisteredPatient>>("/api/patients", payload)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing patient data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update patient information
 * @param id - Patient ID
 * @param data - Partial patient data to update
 * @returns Updated patient
 */
export async function updatePatient(
  id: string,
  data: Partial<PatientFormData>
): Promise<RegisteredPatient> {
  try {
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
    }

    const response = await axios.patch<ResponseApi<RegisteredPatient>>(
      `/api/patients/${id}`,
      payload
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing patient data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get patient by ID
 * @param id - Patient ID
 * @returns Patient data
 */
export async function getPatient(id: string): Promise<RegisteredPatient> {
  try {
    const response = await axios.get<ResponseApi<RegisteredPatient>>(`/api/patients/${id}`)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing patient data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}
