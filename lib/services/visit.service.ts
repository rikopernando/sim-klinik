/**
 * Visit Service - Handles all visit-related API calls
 */

import axios from "axios"
import { type VisitFormData, type RegisteredVisit } from "@/types/registration"
import { type ResponseApi } from "@/types/api"
import { handleApiError, ApiServiceError } from "./api.service"

/**
 * Register a new visit
 * @param patientId - Patient ID
 * @param data - Visit form data
 * @returns Newly registered visit
 */
export async function registerVisit(
  patientId: string,
  data: VisitFormData
): Promise<RegisteredVisit> {
  try {
    const response = await axios.post<ResponseApi<RegisteredVisit>>("/api/visits", {
      ...data,
      patientId,
    })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing visit data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get queue for specific visit type
 * @param visitType - Optional visit type filter
 * @returns Array of visits in queue
 */
export async function getQueue(visitType?: string): Promise<RegisteredVisit[]> {
  try {
    const response = await axios.get<ResponseApi<RegisteredVisit[]>>("/api/visits", {
      params: visitType ? { visitType } : undefined,
    })

    return response.data.data || []
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update visit status
 * @param visitId - Visit ID
 * @param newStatus - New status to set
 * @param reason - Optional reason for status change
 */
export async function updateVisitStatus(
  visitId: string,
  newStatus: string,
  reason?: string
): Promise<void> {
  try {
    await axios.patch<ResponseApi<null>>("/api/visits/status", {
      visitId,
      newStatus,
      reason,
    })
  } catch (error) {
    handleApiError(error)
  }
}
