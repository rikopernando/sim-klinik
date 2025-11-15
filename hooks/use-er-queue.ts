/**
 * useERQueue Hook
 * Manages ER queue data fetching and real-time updates
 */

import { useState, useEffect, useCallback } from "react";
import { ERQueueItem, TriageStatistics, APIResponse } from "@/types/emergency";
import { sortByTriagePriority } from "@/lib/emergency/triage-utils";

interface UseERQueueOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseERQueueReturn {
    queue: ERQueueItem[];
    sortedQueue: ERQueueItem[];
    statistics: TriageStatistics;
    isLoading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    fetchQueue: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useERQueue(options: UseERQueueOptions = {}): UseERQueueReturn {
    const { autoRefresh = true, refreshInterval = 30000 } = options;

    const [queue, setQueue] = useState<ERQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    /**
     * Fetch queue data from API
     */
    const fetchQueue = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/visits?visitType=emergency&status=pending");
            const data: APIResponse<ERQueueItem[]> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch ER queue");
            }

            setQueue(data.data || []);
            setLastRefresh(new Date());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch ER queue";
            setError(errorMessage);
            console.error("ER Queue fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Manual refresh
     */
    const refresh = useCallback(async () => {
        await fetchQueue();
    }, [fetchQueue]);

    /**
     * Calculate statistics from queue
     */
    const statistics: TriageStatistics = {
        total: queue.length,
        red: queue.filter((item) => item.visit.triageStatus === "red").length,
        yellow: queue.filter((item) => item.visit.triageStatus === "yellow").length,
        green: queue.filter((item) => item.visit.triageStatus === "green").length,
        untriaged: queue.filter((item) => !item.visit.triageStatus).length,
    };

    /**
     * Sort queue by triage priority
     */
    const sortedQueue = sortByTriagePriority(queue);

    /**
     * Initial fetch
     */
    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    /**
     * Auto-refresh interval
     */
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchQueue();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchQueue]);

    return {
        queue,
        sortedQueue,
        statistics,
        isLoading,
        error,
        lastRefresh,
        fetchQueue,
        refresh,
    };
}
