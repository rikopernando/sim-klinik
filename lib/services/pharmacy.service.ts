/**
 * Pharmacy Service
 * Client-side service for pharmacy operations using axios
 */

import axios from "axios"
import { ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "@/lib/services/api.service"
import {
  ExpiringDrugsData,
  PrescriptionFulfillmentInput,
  PrescriptionQueueItem,
} from "@/types/pharmacy"

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
export async function bulkFulfillPrescriptions(prescriptions: PrescriptionFulfillmentInput[]) {
  try {
    await axios.post<ResponseApi<BulkFulfillmentResponse>>("/api/pharmacy/fulfillment/bulk", {
      prescriptions,
    })
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
