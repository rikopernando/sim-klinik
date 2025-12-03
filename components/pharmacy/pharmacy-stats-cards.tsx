/**
 * Pharmacy Stats Cards Component (Refactored)
 * Displays statistics using reusable StatCard components
 */

import { useMemo } from "react"
import { StatCard } from "./stats/stat-card"

interface ExpiringDrugsData {
  expired: unknown[]
  expiringSoon: unknown[]
  warning: unknown[]
  all: unknown[]
}

interface PharmacyStatsCardsProps {
  queueCount: number
  expiringDrugs: ExpiringDrugsData
}

export function PharmacyStatsCards({ queueCount, expiringDrugs }: PharmacyStatsCardsProps) {
  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(
    () => ({
      queue: queueCount,
      expired: expiringDrugs.expired.length,
      expiringSoon: expiringDrugs.expiringSoon.length,
      warning: expiringDrugs.warning.length,
    }),
    [queueCount, expiringDrugs]
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard
        title="Resep Pending"
        value={stats.queue}
        description="Menunggu proses"
        variant="default"
      />

      <StatCard
        title="Kadaluarsa"
        value={stats.expired}
        description="Sudah kadaluarsa"
        variant="danger"
      />

      <StatCard
        title="Segera Kadaluarsa"
        value={stats.expiringSoon}
        description="< 30 hari"
        variant="warning"
      />

      <StatCard
        title="Perhatian"
        value={stats.warning}
        description="30-90 hari"
        variant="caution"
      />
    </div>
  )
}
