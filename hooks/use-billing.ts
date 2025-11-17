/**
 * Billing Hook
 * Manages billing operations and state
 */

import { useState, useCallback } from "react";
import type { CreateBillingInput } from "@/types/billing";

interface UseBillingReturn {
    createBilling: (data: CreateBillingInput) => Promise<boolean>;
    fetchBilling: (visitId: number) => Promise<any>;
    isSubmitting: boolean;
    isLoading: boolean;
    error: string | null;
    success: boolean;
    billing: any | null;
}

export function useBilling(): UseBillingReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [billing, setBilling] = useState<any | null>(null);

    const createBilling = async (data: CreateBillingInput): Promise<boolean> => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(false);

            const response = await fetch("/api/billing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create billing");
            }

            setBilling(result.data);
            setSuccess(true);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            console.error("Billing creation error:", err);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchBilling = useCallback(async (visitId: number): Promise<any> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/billing?visitId=${visitId}`);
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setBilling(null);
                    return null;
                }
                throw new Error(result.error || "Failed to fetch billing");
            }

            setBilling(result.data);
            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            console.error("Billing fetch error:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        createBilling,
        fetchBilling,
        isSubmitting,
        isLoading,
        error,
        success,
        billing,
    };
}
