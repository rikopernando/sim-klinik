/**
 * Patient Service - Handles all patient-related API calls
 */

import axios from "axios"
import { type PatientFormData, type RegisteredPatient } from "@/types/registration"

/**
 * Search patients by query (NIK, MR Number, or Name)
 */
export async function searchPatients(query: string): Promise<RegisteredPatient[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await axios.get<{ data: RegisteredPatient[] }>("/api/patients/search", {
    params: { q: query },
  })

  return response.data.data || []
}

/**
 * Register a new patient
 */
export async function registerPatient(data: PatientFormData): Promise<RegisteredPatient> {
  // Convert Date to ISO string for API
  const payload = {
    ...data,
    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
  }

  const response = await axios.post<{ data: RegisteredPatient }>("/api/patients", payload)

  return response.data.data
}

/**
 * Update patient information
 */
export async function updatePatient(
  id: number,
  data: Partial<PatientFormData>
): Promise<RegisteredPatient> {
  const payload = {
    ...data,
    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
  }

  const response = await axios.patch<{ data: RegisteredPatient }>(`/api/patients/${id}`, payload)

  return response.data.data
}

/**
 * Get patient by ID
 */
export async function getPatient(id: number): Promise<RegisteredPatient> {
  const response = await axios.get<{ data: RegisteredPatient }>(`/api/patients/${id}`)

  return response.data.data
}
