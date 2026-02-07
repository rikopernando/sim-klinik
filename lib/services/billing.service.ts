/**
 * Billing Service
 * Client-side service for billing operations using axios
 */

import axios from "axios"

import { ResponseApi, Pagination } from "@/types/api"
import type {
  BillingDetails,
  BillingQueueItem,
  ProcessPaymentResult,
  DischargeBillingSummary,
} from "@/types/billing"
import type { TransactionHistoryItem, TransactionHistoryFilters } from "@/types/transaction"

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

// ============================================================================
// INPATIENT DISCHARGE BILLING
// ============================================================================

/**
 * Get discharge billing summary
 * Fetches aggregated billing preview with itemized breakdown
 */
export async function getDischargeBillingSummary(
  visitId: string
): Promise<DischargeBillingSummary> {
  try {
    const response = await axios.get<ResponseApi<DischargeBillingSummary>>(
      `/api/billing/discharge/${visitId}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in getDischargeBillingSummary service:", error)
    handleApiError(error)
  }
}

/**
 * Create discharge billing record
 * Creates billing from aggregated inpatient charges with optional adjustment
 * Called by clinical staff when completing inpatient treatment
 */
export async function createDischargeBilling(
  visitId: string,
  billingAdjustment?: number,
  adjustmentNote?: string
) {
  try {
    await axios.post("/api/billing/discharge/create", {
      visitId,
      billingAdjustment,
      adjustmentNote,
    })
  } catch (error) {
    console.error("Error in createDischargeBilling service:", error)
    handleApiError(error)
  }
}

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

export interface FetchTransactionHistoryParams {
  filters?: TransactionHistoryFilters
  page?: number
  limit?: number
}

export interface FetchTransactionHistoryResult {
  transactions: TransactionHistoryItem[]
  pagination: Pagination
}

/**
 * Fetch transaction history
 * Fetches payment transactions with filters and pagination
 */
export async function fetchTransactionHistory(
  params?: FetchTransactionHistoryParams
): Promise<FetchTransactionHistoryResult> {
  try {
    const queryParams = new URLSearchParams()

    if (params?.filters?.search) {
      queryParams.set("search", params.filters.search)
    }
    if (params?.filters?.paymentMethod) {
      queryParams.set("paymentMethod", params.filters.paymentMethod)
    }
    if (params?.filters?.visitType) {
      queryParams.set("visitType", params.filters.visitType)
    }
    if (params?.filters?.dateFrom) {
      queryParams.set("dateFrom", params.filters.dateFrom)
    }
    if (params?.filters?.dateTo) {
      queryParams.set("dateTo", params.filters.dateTo)
    }
    if (params?.page) {
      queryParams.set("page", String(params.page))
    }
    if (params?.limit) {
      queryParams.set("limit", String(params.limit))
    }

    const url = `/api/billing/transactions?${queryParams.toString()}`
    const response = await axios.get<ResponseApi<TransactionHistoryItem[]>>(url)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return {
      transactions: response.data.data,
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    }
  } catch (error) {
    console.error("Error in fetchTransactionHistory service:", error)
    handleApiError(error)
  }
}

/**
 * Fetch single transaction detail
 * Fetches a specific payment transaction by ID
 */
export async function fetchTransactionDetail(paymentId: string): Promise<TransactionHistoryItem> {
  try {
    const response = await axios.get<ResponseApi<TransactionHistoryItem>>(
      `/api/billing/transactions/${paymentId}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error in fetchTransactionDetail service:", error)
    handleApiError(error)
  }
}
