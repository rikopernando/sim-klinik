/**
 * Doctor Dashboard Stats Hook (H.3.3)
 * Fetch and manage doctor dashboard statistics
 */

import { useState, useEffect, useCallback } from "react";

export interface DoctorStats {
    today: {
        total: number;
        waiting: number;
        inProgress: number;
        completed: number;
    };
    unlockedRecords: number;
    totalPatients: number;
    lastUpdated: string;
}

export interface UseDoctorStatsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

export function useDoctorStats(options: UseDoctorStatsOptions = {}) {
    const { autoRefresh = false, refreshInterval = 60000 } = options;

    const [stats, setStats] = useState<DoctorStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/dashboard/doctor/stats");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch statistics");
            }

            setStats(data.data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Fetch stats error:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();

        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchStats, autoRefresh, refreshInterval]);

    return {
        stats,
        isLoading,
        error,
        lastRefresh,
        refresh: fetchStats,
    };
}
