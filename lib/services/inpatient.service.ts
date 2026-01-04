import axios from "axios"
import {
  PatientSearchResult,
  Room,
  InpatientPatient,
  InpatientFilters,
  PatientDetail,
  CPPT,
  MaterialUsage,
  AdministerPrescriptionInput,
  InpatientProcedureInput,
  InpatientProcedure,
  UpdateProcedureStatusInput,
} from "@/types/inpatient"
import { Pagination, ResponseApi } from "@/types/api"
import {
  BedAssignmentInput,
  BedTransferInput,
  CPPTInput,
  VitalSignsInput,
  MaterialUsageInput,
  InpatientPrescriptionInput,
} from "@/lib/inpatient/validation"
import type { Material } from "@/types/material"

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

export async function transferBed(payload: BedTransferInput): Promise<void> {
  try {
    await axios.post("/api/inpatient/transfer-bed", payload)
  } catch (error) {
    console.error("Error transferring bed:", error)
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

/**
 * Create a CPPT entry
 */
export async function createCPPTEntry(
  data: Omit<CPPTInput, "authorId" | "authorRole">
): Promise<void> {
  try {
    await axios.post("/api/inpatient/cppt", data)
  } catch (error) {
    console.error("Error creating CPPT entry:", error)
    handleApiError(error)
  }
}

/**
 * Fetch CPPT entries for a visit
 */
export async function fetchCPPTEntries(visitId: string): Promise<CPPT[]> {
  try {
    const response = await axios.get<ResponseApi<CPPT[]>>(`/api/inpatient/cppt?visitId=${visitId}`)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }
    return response.data.data
  } catch (error) {
    console.error("Error fetching CPPT entries:", error)
    handleApiError(error)
  }
}

/**
 * Update a CPPT entry (within 2 hours)
 */
export async function updateCPPTEntry(
  cpptId: string,
  data: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
    progressNote: string
    instructions?: string
  }
): Promise<void> {
  try {
    await axios.put(`/api/inpatient/cppt/${cpptId}`, data)
  } catch (error) {
    console.error("Error updating CPPT entry:", error)
    handleApiError(error)
  }
}

/**
 * Delete a CPPT entry (within 1 hour)
 */
export async function deleteCPPTEntry(cpptId: string): Promise<void> {
  try {
    await axios.delete(`/api/inpatient/cppt/${cpptId}`)
  } catch (error) {
    console.error("Error deleting CPPT entry:", error)
    handleApiError(error)
  }
}

/**
 * Record material usage
 */
export async function recordMaterialUsage(data: MaterialUsageInput): Promise<void> {
  try {
    await axios.post("/api/materials", data)
  } catch (error) {
    console.error("Error recording material usage:", error)
    handleApiError(error)
  }
}

/**
 * Fetch material usage for a visit
 */
export async function fetchMaterialUsage(
  visitId: string
): Promise<{ materials: MaterialUsage[]; totalCost: string }> {
  try {
    const response = await axios.get<
      ResponseApi<MaterialUsage[]> & { totalCost: string; count: number }
    >(`/api/materials?visitId=${visitId}`)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return {
      materials: response.data.data,
      totalCost: response.data.totalCost || "0",
    }
  } catch (error) {
    console.error("Error fetching material usage:", error)
    handleApiError(error)
  }
}

/**
 * Delete material usage (within 1 hour)
 */
export async function deleteMaterialUsage(materialId: string): Promise<void> {
  try {
    await axios.delete(`/api/materials/${materialId}`)
  } catch (error) {
    console.error("Error deleting material usage:", error)
    handleApiError(error)
  }
}

/**
 * Search materials from unified inventory
 * Fetches materials with stock information
 */
export async function searchMaterials(params?: {
  search?: string
  limit?: number
}): Promise<Material[]> {
  try {
    const response = await axios.get<ResponseApi<Material[]>>(`/api/materials`, { params })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error searching materials:", error)
    handleApiError(error)
  }
}

// ============================================================================
// PRESCRIPTIONS (Inpatient)
// ============================================================================

/**
 * Create inpatient prescription order
 */
export async function createInpatientPrescription(data: InpatientPrescriptionInput): Promise<void> {
  try {
    await axios.post("/api/inpatient/prescriptions", data)
  } catch (error) {
    console.error("Error creating prescription:", error)
    handleApiError(error)
  }
}
/**
 * Mark prescription as administered (for nurses)
 */
export async function administerPrescription(data: AdministerPrescriptionInput): Promise<void> {
  try {
    await axios.post("/api/inpatient/prescriptions/administer", data)
  } catch (error) {
    console.error("Error administering prescription:", error)
    handleApiError(error)
  }
}

/**
 * Delete prescription order
 */
export async function deleteInpatientPrescription(prescriptionId: string): Promise<void> {
  try {
    await axios.delete(`/api/inpatient/prescriptions/${prescriptionId}`)
  } catch (error) {
    console.error("Error deleting prescription:", error)
    handleApiError(error)
  }
}

// ============================================================================
// PROCEDURES (Inpatient)
// ============================================================================

/**
 * Create inpatient procedure order
 */
export async function createInpatientProcedure(data: InpatientProcedureInput): Promise<void> {
  try {
    await axios.post("/api/inpatient/procedures", data)
  } catch (error) {
    console.error("Error creating procedure:", error)
    handleApiError(error)
  }
}

/**
 * Fetch procedures for a visit
 */
export async function fetchInpatientProcedures(visitId: string): Promise<InpatientProcedure[]> {
  try {
    const response = await axios.get<ResponseApi<InpatientProcedure[]>>(
      `/api/inpatient/procedures?visitId=${visitId}`
    )
    return response.data.data || []
  } catch (error) {
    console.error("Error fetching procedures:", error)
    handleApiError(error)
  }
}

/**
 * Update procedure status
 */
export async function updateProcedureStatus(data: UpdateProcedureStatusInput): Promise<void> {
  try {
    await axios.patch("/api/inpatient/procedures/status", data)
  } catch (error) {
    console.error("Error updating procedure status:", error)
    handleApiError(error)
  }
}

/**
 * Delete procedure order
 */
export async function deleteInpatientProcedure(procedureId: string): Promise<void> {
  try {
    await axios.delete(`/api/inpatient/procedures/${procedureId}`)
  } catch (error) {
    console.error("Error deleting procedure:", error)
    handleApiError(error)
  }
}
