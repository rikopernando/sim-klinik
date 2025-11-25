/**
 * Prescription Fulfillment Hook
 * Handles prescription dispensing operations
 */

import { useState } from "react";
import {
    fulfillPrescription as fulfillPrescriptionService,
    type PrescriptionFulfillmentData,
} from "@/lib/services/pharmacy.service";

interface UsePrescriptionFulfillmentReturn {
    fulfillPrescription: (data: PrescriptionFulfillmentData) => Promise<boolean>;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
}

export function usePrescriptionFulfillment(): UsePrescriptionFulfillmentReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fulfillPrescription = async (
        data: PrescriptionFulfillmentData
    ): Promise<boolean> => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(false);

            const result = await fulfillPrescriptionService(data);

            if (!result.success) {
                throw new Error(result.error || "Failed to fulfill prescription");
            }

            setSuccess(true);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            console.error("Prescription fulfillment error:", err);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        fulfillPrescription,
        isSubmitting,
        error,
        success,
    };
}
