/**
 * Inventory Hook
 * Manages drug inventory data fetching
 */

import { useState, useEffect, useCallback } from "react";
import {
    getAllInventories,
    type DrugInventoryWithDetails,
} from "@/lib/services/inventory.service";

interface UseInventoryOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseInventoryReturn {
    inventories: DrugInventoryWithDetails[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useInventory(options: UseInventoryOptions = {}): UseInventoryReturn {
    const { autoRefresh = false, refreshInterval = 60000 } = options;

    const [inventories, setInventories] = useState<DrugInventoryWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log({ inventories})

    const fetchInventories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getAllInventories();
            setInventories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Inventory fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchInventories();
    }, [fetchInventories]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchInventories();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchInventories]);

    return {
        inventories,
        isLoading,
        error,
        refresh: fetchInventories,
    };
}
