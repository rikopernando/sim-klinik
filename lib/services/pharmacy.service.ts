/**
 * Pharmacy Service
 * Client-side service for pharmacy operations using axios
 */

import axios from "axios";

export interface PrescriptionQueueItem {
    prescription: {
        id: number;
        dosage: string;
        frequency: string;
        quantity: number;
        duration: string | null;
        instructions: string | null;
        isFulfilled: boolean;
        createdAt: Date;
    };
    drug: {
        id: number;
        name: string;
        genericName: string | null;
        unit: string;
    };
    patient: {
        id: number;
        name: string;
        mrNumber: string;
    } | null;
    doctor: {
        id: string;
        name: string;
    } | null;
}

export interface PrescriptionFulfillmentData {
    prescriptionId: number;
    inventoryId: number;
    dispensedQuantity: number;
    fulfilledBy: string;
    notes?: string;
}

/**
 * Get pending prescriptions queue
 */
export async function getPharmacyQueue(): Promise<PrescriptionQueueItem[]> {
    const response = await axios.get("/api/pharmacy/queue");
    return response.data.data || [];
}

/**
 * Fulfill a prescription
 */
export async function fulfillPrescription(
    data: PrescriptionFulfillmentData
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await axios.post("/api/pharmacy/queue", data);
        return {
            success: true,
            message: response.data.message,
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
