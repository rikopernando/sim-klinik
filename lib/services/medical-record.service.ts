/**
 * Medical Record Service
 * Service layer for medical records operations
 */

import axios from "axios"

import { ResponseApi } from "@/types/api"
import {
  MedicalRecordData,
  MedicalRecordFormData,
  MedicalRecord,
  Diagnosis,
} from "@/types/medical-record"
import {
  CreateDiagnosisFormData,
  CreateProcedureFormData,
  LockMedicalRecordPayload,
  PrescriptionFormDataPayload,
  ProcedureFormData,
  UpdateDiagnosisFormData,
} from "@/lib/validations/medical-record"
import { ApiServiceError, handleApiError } from "@/lib/services/api.service"
/**
 * Get medical record by visit ID
 */
export async function getMedicalRecordByVisit(visitId: string): Promise<MedicalRecordData> {
  try {
    const response = await axios.get<ResponseApi<MedicalRecordData>>(
      `/api/medical-records/${visitId}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing medical record data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Create a new medical record
 */
export async function createMedicalRecord(data: MedicalRecordFormData): Promise<MedicalRecord> {
  try {
    const response = await axios.post<ResponseApi<MedicalRecord>>("/api/medical-records", data)
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing medical record data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update a medical record by visit ID
 */
export async function updateMedicalRecordByVisit(
  visitId: string,
  data: Partial<MedicalRecordFormData>
): Promise<MedicalRecord> {
  try {
    const response = await axios.patch<ResponseApi<MedicalRecord>>(
      `/api/medical-records/${visitId}`,
      data
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing medical record data")
    }
    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Lock a medical record with optional billing adjustment
 */
export async function lockMedicalRecord(data: LockMedicalRecordPayload) {
  try {
    await axios.post<ResponseApi>("/api/medical-records/lock", data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Unlock a medical record
 */
export async function unlockMedicalRecord(id: string) {
  try {
    await axios.post<{ data: MedicalRecord }>("/api/medical-records/unlock", {
      id,
    })
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Add a diagnosis to a medical record
 */
export async function addDiagnosis(data: CreateDiagnosisFormData): Promise<Diagnosis> {
  try {
    const response = await axios.post<ResponseApi<Diagnosis>>(
      "/api/medical-records/diagnoses",
      data
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing diagnosis data")
    }
    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update a diagnosis
 */
export async function updateDiagnosis(data: UpdateDiagnosisFormData): Promise<Diagnosis> {
  try {
    const { diagnosisId, ...updateData } = data
    const response = await axios.patch<ResponseApi<Diagnosis>>(
      `/api/medical-records/diagnoses/${diagnosisId}`,
      updateData
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing diagnosis data")
    }
    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Delete a diagnosis
 */
export async function deleteDiagnosis(id: string): Promise<void> {
  try {
    await axios.delete(`/api/medical-records/diagnoses/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Add a procedure to a medical record
 */
export async function addProcedure(data: CreateProcedureFormData) {
  try {
    await axios.post<ResponseApi>("/api/medical-records/procedures", data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update a procedure
 */
export async function updateProcedure(id: string, data: ProcedureFormData) {
  try {
    await axios.patch<ResponseApi>(`/api/medical-records/procedures/${id}`, data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Delete a procedure
 */
export async function deleteProcedure(id: string): Promise<void> {
  try {
    await axios.delete(`/api/medical-records/procedures/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Add a prescription to a medical record
 */
export async function addPrescription(data: PrescriptionFormDataPayload) {
  try {
    await axios.post<ResponseApi>("/api/medical-records/prescriptions", data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update a prescription
 */
export async function updatePrescription(id: string, data: PrescriptionFormDataPayload) {
  try {
    await axios.patch<ResponseApi>(`/api/medical-records/prescriptions/${id}`, data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Delete a prescription
 */
export async function deletePrescription(id: string): Promise<void> {
  try {
    await axios.delete(`/api/medical-records/prescriptions/${id}`)
  } catch (error) {
    handleApiError(error)
  }
}
