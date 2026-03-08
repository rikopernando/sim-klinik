/**
 * Visit Service - Handles all visit-related API calls
 */

import axios from "axios"
import { type VisitFormData, type RegisteredVisit } from "@/types/registration"
import { type ResponseApi, type Pagination } from "@/types/api"
import { handleApiError, ApiServiceError } from "./api.service"
import { type VisitHistoryItem, type VisitHistoryFilters } from "@/types/visit-history"

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

/**
 * Get a single visit by ID with patient data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVisit(visitId: string): Promise<any> {
  try {
    const response = await axios.get(`/api/visits/${visitId}`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update visit details (PATCH)
 */
export async function updateVisit(visitId: string, data: Record<string, unknown>): Promise<void> {
  try {
    await axios.patch(`/api/visits/${visitId}`, data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get latest vitals for a visit
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVisitVitals(visitId: string): Promise<any | null> {
  try {
    const response = await axios.get<ResponseApi<unknown>>(`/api/visits/${visitId}/vitals`)
    return response.data.data || null
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Record new vitals for a visit
 */
export async function recordVisitVitals(
  visitId: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await axios.post(`/api/visits/${visitId}/vitals`, data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fetch visit history with filters and pagination
 */
export interface FetchVisitHistoryParams {
  filters?: VisitHistoryFilters
  page?: number
  limit?: number
}

export interface FetchVisitHistoryResult {
  visits: VisitHistoryItem[]
  pagination: Pagination
}

export async function fetchVisitHistory(
  params?: FetchVisitHistoryParams
): Promise<FetchVisitHistoryResult> {
  try {
    const response = await axios.get<ResponseApi<VisitHistoryItem[]>>("/api/visits/history", {
      params: {
        ...params?.filters,
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    })

    return {
      visits: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    }
  } catch (error) {
    handleApiError(error)
  }
}
