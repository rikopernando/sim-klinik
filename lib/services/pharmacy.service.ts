/**
 * Pharmacy Service
 * Client-side service for pharmacy operations using axios
 */

import axios from "axios"
import { ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "@/lib/services/api.service"
import { ExpiringDrugsData, PrescriptionFulfillmentInput } from "@/types/pharmacy"

export interface PrescriptionQueueItem {
  prescription: {
    id: string
    dosage: string
    frequency: string
    quantity: number
    duration: string | null
    instructions: string | null
    isFulfilled: boolean
    createdAt: Date
  }
  drug: {
    id: string
    name: string
    genericName: string | null
    unit: string
  }
  patient: {
    id: string
    name: string
    mrNumber: string
  } | null
  doctor: {
    id: string
    name: string
  } | null
}

export interface BulkFulfillmentResponse {
  success: boolean
  message: string
  fulfilled: number
  total: number
}

/**
 * Get pending prescriptions queue
 */
export async function getPharmacyQueue(): Promise<PrescriptionQueueItem[]> {
  try {
    const response = await axios.get<ResponseApi<PrescriptionQueueItem[]>>("/api/pharmacy/queue")

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing pharmacy queue data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fulfill a single prescription
 */
export async function fulfillPrescription(data: PrescriptionFulfillmentInput): Promise<string> {
  try {
    const response = await axios.post<ResponseApi>("/api/pharmacy/queue", data)
    return response.data.message || "Prescription fulfilled successfully"
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Bulk fulfill multiple prescriptions in one transaction
 */
export async function bulkFulfillPrescriptions(
  prescriptions: PrescriptionFulfillmentInput[]
): Promise<BulkFulfillmentResponse> {
  try {
    const response = await axios.post<ResponseApi<BulkFulfillmentResponse>>(
      "/api/pharmacy/fulfillment/bulk",
      { prescriptions }
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing bulk fulfillment data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Get expiring drugs (expiry date < 30 days)
 * Returns drugs grouped by expiry alert level
 */
export async function getExpiringDrugs(): Promise<ExpiringDrugsData> {
  try {
    const response = await axios.get<ResponseApi<ExpiringDrugsData>>("/api/pharmacy/expiring")

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing expiring drugs data")
    }

    return response.data.data
  } catch (error) {
    handleApiError(error)
  }
}
