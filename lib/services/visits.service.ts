/**
 * Visits Service - Client-side API calls for Visits
 * Handles all visit-related API calls using axios
 */

import axios from "axios"
import { type ResponseApi } from "@/types/api"
import { handleApiError } from "./api.service"

/**
 * Disposition type for ER visits
 */
export type DispositionType = "discharged" | "admitted" | "referred" | "observation"

/**
 * Visit with patient data
 */
export interface Visit {
  id: string
  visitNumber: string
  visitType: string
  triageStatus: "red" | "yellow" | "green" | null
  chiefComplaint: string | null
  status: string
  disposition: DispositionType | null
  arrivalTime: Date
  startTime: Date | null
  endTime: Date | null
  queueNumber: string | null
  poliId: string | null
  doctorId: string | null
  roomId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  patient: {
    id: string
    name: string
    mrNumber: string
    nik: string | null
    gender: string
    dateOfBirth: Date | null
    phone: string | null
    address: string | null
  }
}

/**
 * Get visit by ID with patient data
 * @param visitId - Visit ID
 * @returns Visit with patient data
 */
export async function getVisitById(visitId: string): Promise<Visit> {
  try {
    const response = await axios.get<Visit>(`/api/visits/${visitId}`)
    return response.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update visit details
 * @param visitId - Visit ID
 * @param data - Partial visit data to update
 */
export interface UpdateVisitData {
  triageStatus?: "red" | "yellow" | "green"
  chiefComplaint?: string
  notes?: string
  doctorId?: string
  roomId?: string
  disposition?: string
}

export async function updateVisit(visitId: string, data: UpdateVisitData): Promise<Visit> {
  try {
    const response = await axios.patch<ResponseApi<Visit>>(`/api/visits/${visitId}`, data)

    if (!response.data.data) {
      throw new Error("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update visit status
 * @param visitId - Visit ID
 * @param newStatus - New status
 * @param reason - Optional reason (for cancellation)
 */
export type VisitStatus =
  | "registered"
  | "waiting"
  | "in_examination"
  | "examined"
  | "ready_for_billing"
  | "billed"
  | "paid"
  | "completed"
  | "cancelled"

export async function updateVisitStatus(
  visitId: string,
  newStatus: VisitStatus,
  reason?: string
): Promise<void> {
  try {
    await axios.patch("/api/visits/status", {
      visitId,
      newStatus,
      reason,
    })
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get visit status information
 * @param visitId - Visit ID
 * @returns Current status and allowed next statuses
 */
export interface VisitStatusInfo {
  visitId: string
  visitNumber: string
  patientId: string
  visitType: string
  currentStatus: VisitStatus
  statusInfo: {
    label: string
    color: string
  }
  isTerminal: boolean
  allowedNextStatuses: Array<{
    status: VisitStatus
    info: {
      label: string
      color: string
    }
  }>
  timestamps: {
    arrivalTime: Date | null
    startTime: Date | null
    endTime: Date | null
    dischargeDate: Date | null
  }
}

export async function getVisitStatus(visitId: string): Promise<VisitStatusInfo> {
  try {
    const response = await axios.get<{ success: boolean; data: VisitStatusInfo }>(
      `/api/visits/status`,
      {
        params: { visitId },
      }
    )

    if (!response.data.data) {
      throw new Error("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}
