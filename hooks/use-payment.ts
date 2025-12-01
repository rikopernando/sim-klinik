/**
 * Payment Processing Hook
 * Handles payment operations with change calculation
 */

import { useState } from "react";
import axios from "axios";

interface PaymentInput {
    visitId: number;
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    amountReceived?: number;
    notes?: string;
}

interface PaymentResult {
    paymentStatus: string;
    paidAmount: number;
    remainingAmount: number;
    changeGiven: number;
}

interface UsePaymentReturn {
    processPayment: (data: PaymentInput) => Promise<PaymentResult | null>;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
    paymentResult: PaymentResult | null;
}

export function usePayment(): UsePaymentReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

    const processPayment = async (data: PaymentInput): Promise<PaymentResult | null> => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(false);

            const response = await axios.post(
                `/api/billing/${data.visitId}/payment`,
                {
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    paymentReference: data.paymentReference,
                    amountReceived: data.amountReceived,
                    notes: data.notes,
                }
            );

            if (response.data.success && response.data.data) {
                setPaymentResult(response.data.data);
                setSuccess(true);
                return response.data.data;
            } else {
                setError(response.data.error || "Failed to process payment");
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            console.error("Payment processing error:", err);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        processPayment,
        isSubmitting,
        error,
        success,
        paymentResult,
    };
}
