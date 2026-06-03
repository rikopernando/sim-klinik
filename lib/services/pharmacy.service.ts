/**
 * Pharmacy Service
 * Client-side service for pharmacy operations using axios
 */

import axios from "axios"
import { Pagination, ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "@/lib/services/api.service"
import {
  ExpiringDrugsData,
  PrescriptionFulfillmentInput,
  PrescriptionQueueItem,
} from "@/types/pharmacy"

export interface PharmacyQueueParams {
  page?: number
  limit?: number
  visitType?: "outpatient" | "inpatient" | "emergency"
}

export interface PharmacyQueueResult {
  data: PrescriptionQueueItem[]
  pagination: Pagination
}

export interface BulkFulfillmentResponse {
  success: boolean
  message: string
  fulfilled: number
  total: number
}

/**
 * Get pending prescriptions queue (paginated)
 */
export async function getPharmacyQueue(
  params: PharmacyQueueParams = {}
): Promise<PharmacyQueueResult> {
  try {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.visitType) searchParams.set("visitType", params.visitType)

    const url = `/api/pharmacy/queue?${searchParams.toString()}`
    const response = await axios.get<ResponseApi<PrescriptionQueueItem[]>>(url)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing pharmacy queue data")
    }

    return {
      data: response.data.data,
      pagination: response.data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    }
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
