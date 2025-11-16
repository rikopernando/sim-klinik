/**
 * Pharmacy Queue Hook
 * Manages prescription queue with auto-refresh
 */

import { useState, useEffect, useCallback } from "react";

interface UsePharmacyQueueOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UsePharmacyQueueReturn {
    queue: any[];
    isLoading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    refresh: () => Promise<void>;
}

export function usePharmacyQueue(
    options: UsePharmacyQueueOptions = {}
): UsePharmacyQueueReturn {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    const [queue, setQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchQueue = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/pharmacy/queue");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch pharmacy queue");
            }

            setQueue(result.data || []);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Pharmacy queue fetch error:", err);
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

        const interval = setInterval(() => {
            fetchQueue();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchQueue]);

    return {
        queue,
        isLoading,
        error,
        lastRefresh,
        refresh: fetchQueue,
    };
}
