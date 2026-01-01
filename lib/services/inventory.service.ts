/**
 * Inventory Service
 * Client-side service for drug inventory operations using axios
 */

import axios from "axios"
import { DrugInventoryInput } from "../pharmacy/validation"
import { ExpiryAlertLevel } from "@/types/pharmacy"
import { Pagination, ResponseApi } from "@/types/api"
import { ApiServiceError, handleApiError } from "./api.service"
import { DuplicateBatchCheck } from "@/types/inventory"

export interface DrugInventory {
  id: string
  drugId: string
  batchNumber: string
  expiryDate: string
  stockQuantity: number
  purchasePrice: string | null
  supplier: string | null
  receivedDate: Date
  createdAt: string
  updatedAt: string
}

export interface DrugInventoryWithDetails extends DrugInventory {
  drug: {
    id: string
    name: string
    genericName: string | null
    unit: string
    category: string | null
  }
  daysUntilExpiry: number
  expiryAlertLevel: ExpiryAlertLevel
}

export interface InventoryByDrugItem {
  drugId: string
  drugName: string
  genericName: string | null
  unit: string
  totalStock: number
  batches: DrugInventoryWithDetails[]
}

/**
 * Get all drug inventories with details (without pagination)
 */
export async function getAllInventories(): Promise<DrugInventoryWithDetails[]> {
  try {
    const response = await axios.get<ResponseApi<DrugInventoryWithDetails[]>>(
      "/api/pharmacy/inventory?limit=1000"
    )
    if (!response.data.data) {
      throw new Error("Invalid response: missing data")
    }
    return response.data.data || []
  } catch (error) {
    console.error("Error in getAllInventories service:", error)
    handleApiError(error)
  }
}

/**
 * Get paginated drug inventories with search support
 */
export async function getPaginatedInventories(params: {
  search?: string
  page?: number
  limit?: number
}): Promise<{
  data: DrugInventoryWithDetails[]
  pagination: Pagination
}> {
  try {
    const url = `/api/pharmacy/inventory`
    const response = await axios.get<ResponseApi<DrugInventoryWithDetails[]>>(url, { params })

    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data")
    }

    if (!response.data.pagination) {
      throw new ApiServiceError("Invalid response: missing pagination")
    }

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    }
  } catch (error) {
    console.error("Error in getPaginatedInventories service:", error)
    handleApiError(error)
  }
}

/**
 * Check if batch number already exists for a drug
 */
export async function checkDuplicateBatch(
  drugId: string,
  batchNumber: string
): Promise<DuplicateBatchCheck> {
  try {
    const response = await axios.get<ResponseApi<DuplicateBatchCheck>>(
      `/api/pharmacy/inventory/${drugId}/check-batch?batchNumber=${encodeURIComponent(batchNumber)}`
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing data duplicate batch check")
    }
    return response.data.data
  } catch (error) {
    console.error("Error in checkDuplicateBatch service:", error)
    handleApiError(error)
  }
}

/**
 * Add new inventory (stock incoming)
 */
export async function addInventory(data: DrugInventoryInput) {
  try {
    await axios.post<ResponseApi>("/api/pharmacy/inventory", data)
  } catch (error) {
    console.error("Error in addInventory service:", error)
    handleApiError(error)
  }
}

/**
 * Get available batches for a drug (for prescription fulfillment)
 * Sorted by expiry date (FEFO - First Expired, First Out)
 */
export async function getAvailableBatches(drugId: string): Promise<DrugInventoryWithDetails[]> {
  try {
    const response = await axios.get<ResponseApi<DrugInventoryWithDetails[]>>(
      `/api/pharmacy/inventory/${drugId}/available`
    )
    if (!response.data.data) {
      throw new ApiServiceError("Invalid response: missing batches data")
    }
    return response.data.data
  } catch (error) {
    console.error("Error in getAvailableBatches service:", error)
    handleApiError(error)
  }
}
