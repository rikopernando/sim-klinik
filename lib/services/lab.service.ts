/**
 * Laboratory & Radiology Service Layer
 * Handles all API calls for lab tests, orders, and results
 */

import axios from "axios"
import type {
  LabTest,
  LabTestFilters,
  LabOrderWithRelations,
  LabOrderFilters,
  CreateLabOrderInput,
  UpdateLabOrderStatusInput,
  CreateLabResultInput,
} from "@/types/lab"
import type { ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"

// ============================================================================
// LAB TESTS
// ============================================================================

/**
 * Fetch lab tests with filters
 */
export async function fetchLabTests(filters?: Partial<LabTestFilters>): Promise<LabTest[]> {
  try {
    const params = {
      ...filters,
      isActive: filters?.isActive ? filters?.isActive?.toString() : undefined,
    }

    const response = await axios.get<ResponseApi<LabTest[]>>(`/api/lab/tests`, { params })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching lab tests:", error)
    handleApiError(error)
  }
}

/**
 * Fetch single lab test by ID
 */
export async function fetchLabTestById(testId: string): Promise<LabTest> {
  try {
    const response = await axios.get<ResponseApi<LabTest>>(`/api/lab/tests/${testId}`)

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching lab test:", error)
    handleApiError(error)
  }
}

// ============================================================================
// LAB ORDERS
// ============================================================================

/**
 * Fetch lab orders with filters
 */
export async function fetchLabOrders(
  filters?: Partial<LabOrderFilters>
): Promise<LabOrderWithRelations[]> {
  try {
    const params = new URLSearchParams()

    if (filters?.visitId) {
      params.append("visitId", filters.visitId)
    }
    if (filters?.patientId) {
      params.append("patientId", filters.patientId)
    }
    if (filters?.status) {
      const statusValue = Array.isArray(filters.status) ? filters.status.join(",") : filters.status
      params.append("status", statusValue)
    }
    if (filters?.department) {
      params.append("department", filters.department)
    }
    if (filters?.dateFrom) {
      params.append("dateFrom", filters.dateFrom.toISOString())
    }
    if (filters?.dateTo) {
      params.append("dateTo", filters.dateTo.toISOString())
    }

    const response = await axios.get<ResponseApi<LabOrderWithRelations[]>>(
      `/api/lab/orders?${params}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching lab orders:", error)
    handleApiError(error)
  }
}

/**
 * Fetch single lab order by ID with full details
 */
export async function fetchLabOrderById(orderId: string): Promise<LabOrderWithRelations> {
  try {
    const response = await axios.get<ResponseApi<LabOrderWithRelations>>(
      `/api/lab/orders/${orderId}`
    )

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    return response.data.data
  } catch (error) {
    console.error("Error fetching lab order:", error)
    handleApiError(error)
  }
}

/**
 * Create new lab order
 */
export async function createLabOrder(data: CreateLabOrderInput): Promise<string> {
  try {
    const response = await axios.post<ResponseApi<{ id: string }>>("/api/lab/orders", data)

    if (!response.data.data?.id) {
      throw new ApiServiceError("Invalid response: missing order ID")
    }

    return response.data.data.id
  } catch (error) {
    console.error("Error creating lab order:", error)
    handleApiError(error)
  }
}

/**
 * Update lab order status
 */
export async function updateLabOrderStatus(
  orderId: string,
  data: UpdateLabOrderStatusInput
): Promise<void> {
  try {
    await axios.put(`/api/lab/orders/${orderId}`, data)
  } catch (error) {
    console.error("Error updating lab order status:", error)
    handleApiError(error)
  }
}

// ============================================================================
// LAB RESULTS
// ============================================================================

/**
 * Create lab result
 */
export async function createLabResult(data: CreateLabResultInput): Promise<{
  id: string
  criticalValue: boolean
}> {
  try {
    const response = await axios.post<ResponseApi<{ id: string; criticalValue: boolean | null }>>(
      "/api/lab/results",
      data
    )

    if (!response.data.data?.id) {
      throw new ApiServiceError("Invalid response: missing result ID")
    }

    return {
      id: response.data.data.id,
      criticalValue: response.data.data.criticalValue || false,
    }
  } catch (error) {
    console.error("Error creating lab result:", error)
    handleApiError(error)
  }
}

/**
 * Verify lab result
 */
export async function verifyLabResult(resultId: string, notes?: string): Promise<void> {
  try {
    await axios.put(`/api/lab/results/${resultId}/verify`, { notes })
  } catch (error) {
    console.error("Error verifying lab result:", error)
    handleApiError(error)
  }
}
