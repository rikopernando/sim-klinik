import { Clock, Activity, Stethoscope, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorStatsSectionProps {
  stats: {
    today: {
      waiting: number
      inProgress: number
      completed: number
    }
    unlockedRecords: number
  } | null
  onTabChange?: (tab: string) => void
}

export function DoctorStatsSection({ stats, onTabChange }: DoctorStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* Antrian Menunggu — navigates to waiting tab */}
      <div
        className={cn(
          "bg-card rounded-xl border px-4 py-3 shadow-sm transition-all",
          onTabChange && "cursor-pointer hover:border-blue-300 hover:shadow-md"
        )}
        onClick={() => onTabChange?.("waiting")}
      >
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">Antrian Menunggu</p>
          <Clock className="h-4 w-4 text-blue-500" />
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.today.waiting ?? 0}</p>
        <p className="text-muted-foreground text-xs">pasien menunggu</p>
        {(stats?.today.waiting ?? 0) > 0 && (
          <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            Butuh Perhatian
          </span>
        )}
      </div>

      {/* Sedang Diperiksa — navigates to in_progress tab */}
      <div
        className={cn(
          "bg-card rounded-xl border px-4 py-3 shadow-sm transition-all",
          onTabChange && "cursor-pointer hover:border-green-300 hover:shadow-md"
        )}
        onClick={() => onTabChange?.("in_progress")}
      >
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">Sedang Diperiksa</p>
          <Activity className="h-4 w-4 text-green-500" />
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.today.inProgress ?? 0}</p>
        <p className="text-muted-foreground text-xs">pasien dalam pemeriksaan</p>
      </div>

      {/* Selesai Hari Ini — no navigation target, not clickable */}
      <div className="bg-card rounded-xl border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">Selesai Hari Ini</p>
          <Stethoscope className="h-4 w-4 text-purple-500" />
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.today.completed ?? 0}</p>
        <p className="text-muted-foreground text-xs">pasien selesai</p>
      </div>

      {/* RME Belum Dikunci — navigates to unlocked tab */}
      <div
        className={cn(
          "bg-card rounded-xl border px-4 py-3 shadow-sm transition-all",
          (stats?.unlockedRecords ?? 0) > 0 && "border-orange-200 dark:border-orange-900/50",
          onTabChange && "cursor-pointer hover:border-orange-300 hover:shadow-md"
        )}
        onClick={() => onTabChange?.("unlocked")}
      >
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-medium">RME Belum Dikunci</p>
          <FileText className="h-4 w-4 text-orange-500" />
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.unlockedRecords ?? 0}</p>
        <p className="text-muted-foreground text-xs">rekam medis</p>
        {(stats?.unlockedRecords ?? 0) > 0 && (
          <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            Action Required
          </span>
        )}
      </div>
    </div>
  )
}
