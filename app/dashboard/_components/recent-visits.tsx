import { db } from "@/db"
import { visits, polis } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { desc, eq } from "drizzle-orm"
import { cn } from "@/lib/utils"

// ── Query ─────────────────────────────────────────────────────────────────────

async function getRecentVisits() {
  return db
    .select({
      id: visits.id,
      patientName: patients.name,
      mrNumber: patients.mrNumber,
      poliName: polis.name,
      visitType: visits.visitType,
      status: visits.status,
      arrivalTime: visits.arrivalTime,
    })
    .from(visits)
    .leftJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(polis, eq(visits.poliId, polis.id))
    .orderBy(desc(visits.arrivalTime))
    .limit(8)
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  registered: {
    label: "Terdaftar",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  waiting: {
    label: "Menunggu",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  in_examination: {
    label: "Diperiksa",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  examined: {
    label: "Selesai Periksa",
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  ready_for_billing: {
    label: "Siap Tagih",
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  billed: {
    label: "Ditagih",
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  paid: {
    label: "Lunas",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  completed: {
    label: "Selesai",
    dot: "bg-green-600",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  cancelled: {
    label: "Dibatalkan",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
}

// ── Components ────────────────────────────────────────────────────────────────

export async function RecentVisits() {
  const rows = await getRecentVisits()
  if (rows.length === 0) return null

  return (
    <div>
      <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
        Kunjungan Terbaru
      </p>
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="divide-y">
          {rows.map((row) => {
            const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.registered
            const dt = row.arrivalTime ? new Date(row.arrivalTime) : null
            const timeStr = dt
              ? dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : "–"
            const dateStr = dt
              ? dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
              : ""
            const initials = (row.patientName ?? "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
            const locationLabel =
              row.visitType === "emergency"
                ? "UGD"
                : row.visitType === "inpatient"
                  ? "Rawat Inap"
                  : (row.poliName ?? "–")

            return (
              <div
                key={row.id}
                className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(82,183,136,0.12)", color: "#2d6a4f" }}
                >
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.patientName ?? "Pasien"}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {row.mrNumber} · {locationLabel}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      cfg.badge
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                  <div className="hidden text-right sm:block">
                    <p className="text-muted-foreground text-xs font-medium">{timeStr}</p>
                    <p className="text-muted-foreground/60 text-[10px]">{dateStr}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function RecentVisitsSkeleton() {
  return (
    <div>
      <div className="bg-muted/50 mb-3 h-3 w-28 animate-pulse rounded" />
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted h-3.5 w-36 animate-pulse rounded" />
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-5 w-20 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
