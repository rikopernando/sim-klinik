/**
 * Expiring Drugs Hook
 * Fetches drugs that are expiring soon
 */

import { useState, useEffect, useCallback } from "react";

interface UseExpiringDrugsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseExpiringDrugsReturn {
    expiringDrugs: {
        all: any[];
        expired: any[];
        expiringSoon: any[];
        warning: any[];
    };
    isLoading: boolean;
    error: string | null;
    lastRefresh: Date | null;
    refresh: () => Promise<void>;
}

export function useExpiringDrugs(
    options: UseExpiringDrugsOptions = {}
): UseExpiringDrugsReturn {
    const { autoRefresh = false, refreshInterval = 60000 } = options;

    const [expiringDrugs, setExpiringDrugs] = useState<{
        all: any[];
        expired: any[];
        expiringSoon: any[];
        warning: any[];
    }>({
        all: [],
        expired: [],
        expiringSoon: [],
        warning: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchExpiringDrugs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/pharmacy/expiring");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch expiring drugs");
            }

            setExpiringDrugs(result.data || { all: [], expired: [], expiringSoon: [], warning: [] });
            setLastRefresh(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Expiring drugs fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchExpiringDrugs();
    }, [fetchExpiringDrugs]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchExpiringDrugs();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchExpiringDrugs]);

    return {
        expiringDrugs,
        isLoading,
        error,
        lastRefresh,
        refresh: fetchExpiringDrugs,
    };
}
