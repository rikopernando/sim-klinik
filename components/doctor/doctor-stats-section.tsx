/**
 * Doctor Dashboard Statistics Section
 */

import { DashboardGrid, DashboardSection, StatWidget } from "@/components/dashboard"
import { Stethoscope, Clock, Activity, FileText } from "lucide-react"

interface DoctorStatsSectionProps {
  stats: {
    today: {
      waiting: number
      inProgress: number
      completed: number
    }
    unlockedRecords: number
  } | null
}

export function DoctorStatsSection({ stats }: DoctorStatsSectionProps) {
  return (
    <DashboardSection title="Statistik Hari Ini" description="Overview kunjungan pasien">
      <DashboardGrid columns={4}>
        <StatWidget
          title="Antrian Menunggu"
          value={stats?.today.waiting || 0}
          subtitle="pasien menunggu"
          icon={Clock}
          iconColor="text-blue-500"
          badge={
            stats?.today.waiting ? { label: "Butuh Perhatian", variant: "default" } : undefined
          }
        />
        <StatWidget
          title="Sedang Diperiksa"
          value={stats?.today.inProgress || 0}
          subtitle="pasien dalam pemeriksaan"
          icon={Activity}
          iconColor="text-green-500"
        />
        <StatWidget
          title="Selesai Hari Ini"
          value={stats?.today.completed || 0}
          subtitle="pasien selesai"
          icon={Stethoscope}
          iconColor="text-purple-500"
        />
        <StatWidget
          title="RME Belum Dikunci"
          value={stats?.unlockedRecords || 0}
          subtitle="rekam medis"
          icon={FileText}
          iconColor="text-orange-500"
          badge={
            stats && stats.unlockedRecords > 0
              ? { label: "Action Required", variant: "destructive" }
              : undefined
          }
        />
      </DashboardGrid>
    </DashboardSection>
  )
}
