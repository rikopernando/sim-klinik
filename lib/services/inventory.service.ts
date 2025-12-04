/**
 * Inventory Service
 * Client-side service for drug inventory operations using axios
 */

import axios from "axios"
import { DrugInventoryInput } from "../pharmacy/validation"
import { ExpiryAlertLevel } from "@/types/pharmacy"

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

export interface DuplicateBatchCheck {
  exists: boolean
  batch?: DrugInventoryWithDetails
}

/**
 * Get all drug inventories with details
 */
export async function getAllInventories(): Promise<DrugInventoryWithDetails[]> {
  const response = await axios.get("/api/pharmacy/inventory")
  return response.data.data || []
}

/**
 * Get inventories for a specific drug
 */
export async function getInventoriesByDrug(drugId: string): Promise<DrugInventoryWithDetails[]> {
  const response = await axios.get(`/api/pharmacy/inventory/${drugId}`)
  return response.data.data || []
}

/**
 * Check if batch number already exists for a drug
 */
export async function checkDuplicateBatch(
  drugId: string,
  batchNumber: string
): Promise<DuplicateBatchCheck> {
  try {
    const response = await axios.get(
      `/api/pharmacy/inventory/${drugId}/check-batch?batchNumber=${encodeURIComponent(batchNumber)}`
    )
    return response.data.data
  } catch (error) {
    console.error("Failed to check duplicate batch:", error)
    return { exists: false }
  }
}

/**
 * Add new inventory (stock incoming)
 */
export async function addInventory(
  data: DrugInventoryInput
): Promise<{ success: boolean; message?: string; error?: string; data?: DrugInventory }> {
  try {
    const response = await axios.post("/api/pharmacy/inventory", data)
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      }
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Get available batches for a drug (for prescription fulfillment)
 * Sorted by expiry date (FEFO - First Expired, First Out)
 */
export async function getAvailableBatches(drugId: string): Promise<DrugInventoryWithDetails[]> {
  const response = await axios.get(`/api/pharmacy/inventory/${drugId}/available`)
  return response.data.data || []
}
