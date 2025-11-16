/**
 * useCPPT Hook
 * Manages CPPT (Integrated Progress Notes) operations
 */

import { useState, useCallback } from "react";
import { CPPT, CPPTInput, APIResponse } from "@/types/inpatient";

interface UseCPPTReturn {
    createEntry: (data: CPPTInput) => Promise<void>;
    fetchEntries: (visitId: number) => Promise<CPPT[]>;
    isSubmitting: boolean;
    isFetching: boolean;
    error: string | null;
    success: boolean;
    reset: () => void;
}

export function useCPPT(): UseCPPTReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    /**
     * Create CPPT entry
     */
    const createEntry = useCallback(async (data: CPPTInput) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("/api/cppt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: APIResponse = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create CPPT entry");
            }

            setSuccess(true);

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to create CPPT entry";
            setError(errorMessage);
            console.error("CPPT creation error:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    /**
     * Fetch CPPT entries
     */
    const fetchEntries = useCallback(async (visitId: number): Promise<CPPT[]> => {
        setIsFetching(true);
        setError(null);

        try {
            const response = await fetch(`/api/cppt?visitId=${visitId}`);
            const result: APIResponse<CPPT[]> = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch CPPT entries");
            }

            return result.data || [];
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to fetch CPPT entries";
            setError(errorMessage);
            console.error("CPPT fetch error:", err);
            return [];
        } finally {
            setIsFetching(false);
        }
    }, []);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
        setIsSubmitting(false);
        setIsFetching(false);
    }, []);

    return {
        createEntry,
        fetchEntries,
        isSubmitting,
        isFetching,
        error,
        success,
        reset,
    };
}
