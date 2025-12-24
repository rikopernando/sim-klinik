import axios from "axios"
import {
  PatientSearchResult,
  Room,
  InpatientPatient,
  InpatientFilters,
  PatientDetail,
} from "@/types/inpatient"
import { Pagination, ResponseApi } from "@/types/api"
import { BedAssignmentInput, VitalSignsInput } from "@/lib/inpatient/validation"

import { ApiServiceError, handleApiError } from "./api.service"

export async function fetchAvailabelRooms(): Promise<Room[]> {
  try {
    const response = await axios.get<ResponseApi<Room[]>>("/api/inpatient/available-rooms")
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching available rooms:", error)
    handleApiError(error)
  }
}

export async function prosesAssignBed(payload: BedAssignmentInput) {
  try {
    await axios.post("/api/inpatient/assign-bed", payload)
  } catch (error) {
    console.error("Error assign bed:", error)
    handleApiError(error)
  }
}

export async function searchUnassignedPatients(params: {
  query: string
}): Promise<PatientSearchResult[]> {
  try {
    const response = await axios.get<ResponseApi<PatientSearchResult[]>>(
      "/api/inpatient/search-unassigned-patients",
      { params }
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching unassigned patients:", error)
    handleApiError(error)
  }
}

/**
 * Fetch all active inpatient patients with filters and pagination
 */
export async function fetchInpatientPatients(params?: {
  filters?: InpatientFilters
  page?: number
  limit?: number
}): Promise<{ patients: InpatientPatient[]; pagination: Pagination }> {
  try {
    const response = await axios.get<ResponseApi<InpatientPatient[]>>("/api/inpatient/patients", {
      params: {
        ...params?.filters,
        page: params?.page,
        limit: params?.limit,
      },
    })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return {
      patients: response.data.data,
      pagination: response.data.pagination as Pagination,
    }
  } catch (error) {
    console.error("Error fetching inpatient patients:", error)
    handleApiError(error)
  }
}

/**
 * Fetch detailed information for a specific inpatient
 */
export async function fetchPatientDetail(visitId: string): Promise<PatientDetail> {
  try {
    const response = await axios.get<ResponseApi<PatientDetail>>(
      `/api/inpatient/patients/${visitId}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching patient detail:", error)
    handleApiError(error)
  }
}

/**
 * Record vital signs for a patient
 */
export async function recordVitalSigns(data: VitalSignsInput): Promise<void> {
  try {
    await axios.post("/api/inpatient/vitals", data)
  } catch (error) {
    console.error("Error recording vital signs:", error)
    handleApiError(error)
  }
}

/**
 * Fetch vital signs history for a visit
 */
export async function fetchVitalSignsHistory(visitId: string) {
  try {
    const response = await axios.get(`/api/inpatient/vitals?visitId=${visitId}`)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }
    return response.data.data
  } catch (error) {
    console.error("Error fetching vital signs history:", error)
    handleApiError(error)
  }
}

/**
 * Delete a vital signs record (within 1 hour)
 */
export async function deleteVitalSigns(vitalId: string): Promise<void> {
  try {
    await axios.delete(`/api/inpatient/vitals/${vitalId}`)
  } catch (error) {
    console.error("Error deleting vital signs:", error)
    handleApiError(error)
  }
}
