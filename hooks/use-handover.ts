/**
 * useHandover Hook
 * Handles patient handover from ER to other departments
 */

import { useState, useCallback } from "react";
import { HandoverData, APIResponse } from "@/types/emergency";

interface UseHandoverReturn {
    handover: (data: HandoverData) => Promise<void>;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
    reset: () => void;
}

export function useHandover(onSuccess?: () => void): UseHandoverReturn {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    /**
     * Perform handover
     */
    const handover = useCallback(
        async (data: HandoverData) => {
            setIsSubmitting(true);
            setError(null);
            setSuccess(false);

            try {
                // Validate required fields
                if (data.newVisitType === "outpatient" && !data.poliId) {
                    throw new Error("Poli wajib dipilih untuk rawat jalan");
                }

                if (data.newVisitType === "inpatient" && !data.roomId) {
                    throw new Error("Kamar wajib dipilih untuk rawat inap");
                }

                const response = await fetch("/api/emergency/handover", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const result: APIResponse = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Gagal melakukan handover");
                }

                setSuccess(true);

                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Terjadi kesalahan";
                setError(errorMessage);
                console.error("Handover error:", err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSuccess]
    );

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
        setIsSubmitting(false);
    }, []);

    return {
        handover,
        isSubmitting,
        error,
        success,
        reset,
    };
}
