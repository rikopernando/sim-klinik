/**
 * Emergency Service - Client-side API calls for Emergency module
 * Handles all emergency/ER-related API calls using axios
 */

import axios from "axios"
import { type ResponseApi } from "@/types/api"
import { handleApiError } from "./api.service"
import type { ERQueueItem } from "@/types/emergency"

/**
 * Get ER Queue
 * Fetches all emergency visits with patient data
 * @param status - Optional visit status filter (if undefined, fetches all statuses)
 * @returns Array of ER queue items
 */
export async function getERQueue(status?: string): Promise<ERQueueItem[]> {
  try {
    const params: Record<string, string> = {
      visitType: "emergency",
    }

    // Only add status filter if provided
    if (status) {
      params.status = status
    }

    const response = await axios.get<ResponseApi<ERQueueItem[]>>("/api/visits", { params })

    return response.data.data || []
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Quick ER Registration
 * Creates a new patient and emergency visit
 * @param data - Quick registration data
 * @returns Created patient and visit
 */
export interface QuickERRegistrationData {
  name: string
  nik?: string
  phone?: string
  gender?: "male" | "female"
  birthDate?: string
  triageStatus: "red" | "yellow" | "green"
  chiefComplaint: string
  notes?: string
}

export interface QuickERRegistrationResult {
  patient: {
    id: string
    mrNumber: string
    name: string
  }
  visit: {
    id: string
    visitNumber: string
  }
}

export async function createQuickERRegistration(
  data: QuickERRegistrationData
): Promise<QuickERRegistrationResult> {
  try {
    const response = await axios.post<ResponseApi<QuickERRegistrationResult>>(
      "/api/emergency/quick-register",
      data
    )

    if (!response.data.data) {
      throw new Error("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Complete Patient Registration
 * Updates patient data after quick registration
 * @param patientId - Patient ID
 * @param data - Complete registration data
 */
export interface CompleteRegistrationData {
  nik: string
  address: string
  birthDate: string
  gender: "male" | "female"
  phone?: string
  insuranceType: string
  insuranceNumber?: string
}

export async function completePatientRegistration(
  patientId: string,
  data: CompleteRegistrationData
): Promise<void> {
  try {
    await axios.patch("/api/emergency/complete-registration", {
      patientId,
      ...data,
    })
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Handover Patient
 * Transfers ER patient to other departments
 * @param data - Handover data
 */
export interface HandoverData {
  visitId: string
  newVisitType: "outpatient" | "inpatient"
  poliId?: string
  doctorId?: string
  roomId?: string
  notes?: string
}

export async function performHandover(data: HandoverData): Promise<void> {
  try {
    await axios.post("/api/emergency/handover", data)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update Visit Disposition
 * Updates the disposition field for an ER visit
 * @param visitId - Visit ID
 * @param disposition - Disposition type
 */
export async function updateVisitDisposition(
  visitId: string,
  disposition: "discharged" | "admitted" | "referred" | "observation"
): Promise<void> {
  try {
    await axios.patch(`/api/visits/${visitId}`, { disposition })
  } catch (error) {
    handleApiError(error)
  }
}
