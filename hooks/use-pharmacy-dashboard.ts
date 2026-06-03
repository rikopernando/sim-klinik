/**
 * Pharmacy Dashboard Hook
 * Manages prescription queue and expiring drugs data
 */

import { usePharmacyQueue } from "./use-pharmacy-queue"
import { useExpiringDrugs } from "./use-expiring-drugs"
import { Pagination } from "@/types/api"

interface UsePharmacyDashboardOptions {
  queueRefreshInterval?: number
  expiringRefreshInterval?: number
  page?: number
  visitType?: "outpatient" | "inpatient" | "emergency" | "all"
}

export function usePharmacyDashboard({
  queueRefreshInterval = 30000,
  expiringRefreshInterval = 60000,
  page = 1,
  visitType,
}: UsePharmacyDashboardOptions = {}) {
  const {
    queue,
    pagination,
    isLoading: queueLoading,
    error: queueError,
    lastRefresh,
    refresh: refreshQueue,
  } = usePharmacyQueue({
    autoRefresh: true,
    refreshInterval: queueRefreshInterval,
    page,
    visitType,
  })

  const {
    expiringDrugs,
    isLoading: expiringLoading,
    error: expiringError,
  } = useExpiringDrugs({
    autoRefresh: true,
    refreshInterval: expiringRefreshInterval,
  })

  return {
    queue,
    pagination,
    queueLoading,
    queueError,
    expiringDrugs,
    expiringLoading,
    expiringError,
    lastRefresh,
    refresh: refreshQueue,
  }
}
