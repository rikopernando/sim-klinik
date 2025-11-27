/**
 * Inventory Service
 * Client-side service for drug inventory operations using axios
 */

import axios from "axios";

export interface DrugInventory {
    id: number;
    drugId: number;
    batchNumber: string;
    expiryDate: Date;
    stockQuantity: number;
    purchasePrice: string | null;
    supplier: string | null;
    receivedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DrugInventoryWithDetails extends DrugInventory {
    drug: {
        id: number;
        name: string;
        genericName: string | null;
        unit: string;
        category: string | null;
    };
    daysUntilExpiry: number;
    expiryAlertLevel: "expired" | "expiring_soon" | "warning" | "ok";
}

export interface AddInventoryInput {
    drugId: number;
    batchNumber: string;
    expiryDate: string; // ISO date string
    stockQuantity: number;
    purchasePrice?: string;
    supplier?: string;
    receivedDate?: string; // ISO date string
}

export interface InventoryByDrugItem {
    drugId: number;
    drugName: string;
    genericName: string | null;
    unit: string;
    totalStock: number;
    batches: DrugInventoryWithDetails[];
}

export interface DuplicateBatchCheck {
    exists: boolean;
    batch?: DrugInventoryWithDetails;
}

/**
 * Get all drug inventories with details
 */
export async function getAllInventories(): Promise<DrugInventoryWithDetails[]> {
    const response = await axios.get("/api/pharmacy/inventory");
    return response.data.data || [];
}

/**
 * Get inventories for a specific drug
 */
export async function getInventoriesByDrug(drugId: number): Promise<DrugInventoryWithDetails[]> {
    const response = await axios.get(`/api/pharmacy/inventory/${drugId}`);
    return response.data.data || [];
}

/**
 * Check if batch number already exists for a drug
 */
export async function checkDuplicateBatch(
    drugId: number,
    batchNumber: string
): Promise<DuplicateBatchCheck> {
    try {
        const response = await axios.get(
            `/api/pharmacy/inventory/${drugId}/check-batch?batchNumber=${encodeURIComponent(batchNumber)}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Failed to check duplicate batch:", error);
        return { exists: false };
    }
}

/**
 * Add new inventory (stock incoming)
 */
export async function addInventory(
    data: AddInventoryInput
): Promise<{ success: boolean; message?: string; error?: string; data?: DrugInventory }> {
    try {
        const response = await axios.post("/api/pharmacy/inventory", data);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

/**
 * Get available batches for a drug (for prescription fulfillment)
 * Sorted by expiry date (FEFO - First Expired, First Out)
 */
export async function getAvailableBatches(drugId: number): Promise<DrugInventoryWithDetails[]> {
    const response = await axios.get(`/api/pharmacy/inventory/${drugId}/available`);
    return response.data.data || [];
}
