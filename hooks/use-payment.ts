/**
 * Payment Processing Hook
 * Handles payment operations with change calculation
 */

import { useState } from "react";
import type { PaymentInput } from "@/types/billing";

interface UsePaymentReturn {
    processPayment: (data: PaymentInput) => Promise<boolean>;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
}

export function usePayment(): UsePaymentReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const processPayment = async (data: PaymentInput): Promise<boolean> => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(false);

            const response = await fetch("/api/billing/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to process payment");
            }

            setSuccess(true);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            console.error("Payment processing error:", err);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        processPayment,
        isSubmitting,
        error,
        success,
    };
}
