/**
 * Pharmacy Dashboard Hook
 * Manages prescription queue and expiring drugs data
 */

import { usePharmacyQueue } from "./use-pharmacy-queue";
import { useExpiringDrugs } from "./use-expiring-drugs";

interface UsePharmacyDashboardOptions {
    queueRefreshInterval?: number;
    expiringRefreshInterval?: number;
}

export function usePharmacyDashboard({
    queueRefreshInterval = 30000,
    expiringRefreshInterval = 60000,
}: UsePharmacyDashboardOptions = {}) {
    const {
        queue,
        isLoading: queueLoading,
        error: queueError,
        lastRefresh,
        refresh: refreshQueue,
    } = usePharmacyQueue({
        autoRefresh: true,
        refreshInterval: queueRefreshInterval,
    });

    const {
        expiringDrugs,
        isLoading: expiringLoading,
        error: expiringError,
    } = useExpiringDrugs({
        autoRefresh: true,
        refreshInterval: expiringRefreshInterval,
    });

    const refresh = () => {
        refreshQueue();
    };

    return {
        queue,
        queueLoading,
        queueError,
        expiringDrugs,
        expiringLoading,
        expiringError,
        lastRefresh,
        refresh,
    };
}
