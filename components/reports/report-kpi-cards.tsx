"use client"

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  BarChart2,
  Activity,
  Users,
  ChevronRight,
} from "lucide-react"
import { formatCurrency } from "@/lib/billing/billing-utils"
import { cn } from "@/lib/utils"
import type { ReportSummary, KpiKey } from "@/types/reports"

interface KpiConfig {
  key: KpiKey
  title: string
  sub: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  borderColor: string
  iconBg: string
  lowerIsBetter?: boolean
  getValue: (s: ReportSummary) => number
  format: (n: number) => string
}

const KPI_CONFIGS: KpiConfig[] = [
  {
    key: "total-tagihan",
    title: "Total Tagihan",
    sub: "Ditagihkan pada periode",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500/8 to-transparent",
    borderColor: "border-l-blue-500",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    getValue: (s) => s.totalBilled,
    format: formatCurrency,
  },
  {
    key: "terkumpul",
    title: "Terkumpul",
    sub: "Pembayaran diterima",
    icon: <Wallet className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/8 to-transparent",
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    getValue: (s) => s.totalCollected,
    format: formatCurrency,
  },
  {
    key: "belum-lunas",
    title: "Belum Lunas",
    sub: "Belum terbayar",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bgGradient: "from-amber-500/8 to-transparent",
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    lowerIsBetter: true,
    getValue: (s) => s.outstanding,
    format: formatCurrency,
  },
  {
    key: "collection-rate",
    title: "Collection Rate",
    sub: "Tingkat penagihan",
    icon: <BarChart2 className="h-4 w-4" />,
    color: "text-violet-600 dark:text-violet-400",
    bgGradient: "from-violet-500/8 to-transparent",
    borderColor: "border-l-violet-500",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    getValue: (s) => s.collectionRate,
    format: (n) => `${n}%`,
  },
  {
    key: "kunjungan",
    title: "Kunjungan",
    sub: "Jumlah kunjungan tercatat",
    icon: <Activity className="h-4 w-4" />,
    color: "text-sky-600 dark:text-sky-400",
    bgGradient: "from-sky-500/8 to-transparent",
    borderColor: "border-l-sky-500",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    getValue: (s) => s.visitCount,
    format: (n) => n.toLocaleString("id-ID"),
  },
  {
    key: "pasien",
    title: "Pasien",
    sub: "Pasien yang berkunjung",
    icon: <Users className="h-4 w-4" />,
    color: "text-pink-600 dark:text-pink-400",
    bgGradient: "from-pink-500/8 to-transparent",
    borderColor: "border-l-pink-500",
    iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",
    getValue: (s) => s.patientCount,
    format: (n) => n.toLocaleString("id-ID"),
  },
]

function getDelta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

interface ComparisonBadgeProps {
  delta: number | null
  lowerIsBetter?: boolean
}

function ComparisonBadge({ delta, lowerIsBetter }: ComparisonBadgeProps) {
  if (delta === null) return null

  const isPositive = delta > 0
  const isGood = lowerIsBetter ? !isPositive : isPositive
  const Icon = isPositive ? TrendingUp : TrendingDown
  const absValue = Math.abs(delta)

  if (delta === 0) {
    return (
      <span className="bg-muted text-muted-foreground inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium">
        0%
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium",
        isGood
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {absValue}%
    </span>
  )
}

interface ReportKpiCardsProps {
  summary: ReportSummary
  previousSummary?: ReportSummary
  onCardClick: (kpi: KpiKey) => void
}

export function ReportKpiCards({ summary, previousSummary, onCardClick }: ReportKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-6">
      {KPI_CONFIGS.map((cfg) => {
        const current = cfg.getValue(summary)
        const previous = previousSummary ? cfg.getValue(previousSummary) : undefined
        const delta = previous !== undefined ? getDelta(current, previous) : null

        return (
          <button
            key={cfg.key}
            onClick={() => onCardClick(cfg.key)}
            className={cn(
              "group bg-card relative overflow-hidden rounded-xl border-l-4 p-5 text-left shadow-sm",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              "focus-visible:ring-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "bg-gradient-to-br",
              cfg.bgGradient,
              cfg.borderColor
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cfg.iconBg)}
              >
                {cfg.icon}
              </div>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100",
                  cfg.color
                )}
              />
            </div>
            <p
              className={cn(
                "font-mono text-xl font-bold tracking-tight sm:text-2xl 2xl:text-xl",
                cfg.color
              )}
            >
              {cfg.format(current)}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-muted-foreground text-[11px] font-medium">{cfg.title}</p>
              <ComparisonBadge delta={delta} lowerIsBetter={cfg.lowerIsBetter} />
            </div>
            <p className="text-muted-foreground/60 text-[10px]">{cfg.sub}</p>
          </button>
        )
      })}
    </div>
  )
}
