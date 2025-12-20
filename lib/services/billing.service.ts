/**
 * Billing Service
 * Client-side service for billing operations using axios
 */

import axios from "axios"

import { ResponseApi } from "@/types/api"
import type { BillingDetails, BillingQueueItem, ProcessPaymentResult } from "@/types/billing"

import { ApiServiceError, handleApiError } from "./api.service"
import { ProcessPaymentInput } from "@/lib/billing/validation"

/**
 * Get billing queue
 * Fetches visits ready for billing
 */
export async function getBillingQueue(): Promise<BillingQueueItem[]> {
  try {
    const response = await axios.get<ResponseApi<BillingQueueItem[]>>("/api/billing/queue")

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getBillingQueue service:", error)
    handleApiError(error)
  }
}

/**
 * Get billing details for a specific visit
 * Fetches billing information, items, and payments
 */
export async function getBillingDetails(visitId: string): Promise<BillingDetails> {
  try {
    const response = await axios.get<ResponseApi<BillingDetails>>(`/api/billing/${visitId}`)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getBillingDetails service:", error)
    handleApiError(error)
  }
}

/**
 * Process payment with optional discount
 * Handles discount application and payment in a single transaction
 */
export async function processPaymentWithDiscount(data: ProcessPaymentInput) {
  try {
    await axios.post<ResponseApi<ProcessPaymentResult>>("/api/billing/process-payment", data)
  } catch (error) {
    console.error("Error in processPaymentWithDiscount service:", error)
    handleApiError(error)
  }
}
