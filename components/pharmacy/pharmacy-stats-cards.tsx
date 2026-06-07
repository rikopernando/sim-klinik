import { useMemo } from "react"
import { ClipboardList, AlertTriangle, Clock, Eye } from "lucide-react"
import { ExpiringDrugsData } from "@/types/pharmacy"

import { StatCard } from "./stats/stat-card"

interface PharmacyStatsCardsProps {
  queueCount: number
  expiringDrugs: ExpiringDrugsData
}

export function PharmacyStatsCards({ queueCount, expiringDrugs }: PharmacyStatsCardsProps) {
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        title="Resep Pending"
        value={stats.queue}
        description="Menunggu proses"
        variant="default"
        icon={<ClipboardList className="h-4 w-4" />}
      />
      <StatCard
        title="Kadaluarsa"
        value={stats.expired}
        description="Sudah kadaluarsa"
        variant="danger"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <StatCard
        title="Segera Kadaluarsa"
        value={stats.expiringSoon}
        description="Dalam 30 hari"
        variant="warning"
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="Perhatian"
        value={stats.warning}
        description="Dalam 30–90 hari"
        variant="caution"
        icon={<Eye className="h-4 w-4" />}
      />
    </div>
  )
}
