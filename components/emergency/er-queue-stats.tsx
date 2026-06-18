import { TriageStatistics } from "@/types/emergency"

interface ERQueueStatsProps {
  statistics: TriageStatistics
}

export function ERQueueStats({ statistics }: ERQueueStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Total Antrian
        </p>
        <p className="mt-1 text-2xl font-bold">{statistics.total}</p>
        <p className="text-muted-foreground text-xs">Pasien menunggu</p>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <div className="mb-1 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <p className="text-xs font-semibold tracking-wide text-red-700 uppercase dark:text-red-400">
            Merah
          </p>
        </div>
        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{statistics.red}</p>
        <p className="text-xs text-red-600 dark:text-red-500">Prioritas tertinggi</p>
      </div>

      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30">
        <div className="mb-1 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <p className="text-xs font-semibold tracking-wide text-yellow-700 uppercase dark:text-yellow-400">
            Kuning
          </p>
        </div>
        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
          {statistics.yellow}
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-500">Prioritas sedang</p>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
        <div className="mb-1 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <p className="text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">
            Hijau
          </p>
        </div>
        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{statistics.green}</p>
        <p className="text-xs text-green-600 dark:text-green-500">Prioritas rendah</p>
      </div>
    </div>
  )
}
