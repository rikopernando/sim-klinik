/**
 * Billing Queue Hook
 * Fetches visits ready for billing with auto-refresh
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Patient {
    id: number;
    mrNumber: string;
    name: string;
    nik?: string | null;
}

interface Visit {
    id: number;
    visitNumber: string;
    visitType: string;
    status: string;
    createdAt: Date;
}

interface Billing {
    id: number;
    totalAmount: string;
    paidAmount: string;
    remainingAmount: string;
    paymentStatus: string;
}

interface MedicalRecord {
    id: number;
    isLocked: boolean;
}

interface BillingQueueItem {
    visit: Visit;
    patient: Patient;
    billing: Billing | null;
    medicalRecord: MedicalRecord;
}

interface UseBillingQueueOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // milliseconds
}

export function useBillingQueue({
    autoRefresh = false,
    refreshInterval = 30000,
}: UseBillingQueueOptions = {}) {
    const [queue, setQueue] = useState<BillingQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchQueue = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get("/api/billing/queue");

            if (response.data.success) {
                setQueue(response.data.data);
                setLastRefresh(new Date());
            } else {
                setError(response.data.error || "Failed to fetch billing queue");
            }
        } catch (err) {
            console.error("Billing queue fetch error:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch billing queue");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchQueue, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchQueue]);

    const refresh = useCallback(() => {
        fetchQueue();
    }, [fetchQueue]);

    return {
        queue,
        isLoading,
        error,
        lastRefresh,
        refresh,
    };
}
