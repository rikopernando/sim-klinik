"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/billing/billing-utils"
import { cn } from "@/lib/utils"
import type {
  KpiKey,
  ReportFilters,
  ReportSummary,
  KpiDetailData,
  KpiDetailPayment,
  KpiDetailBilling,
  KpiDetailVisit,
  KpiDetailPatient,
} from "@/types/reports"

const KPI_META: Record<
  KpiKey,
  { title: string; description: string; color: string; badgeClass: string }
> = {
  "total-tagihan": {
    title: "Total Tagihan",
    description: "Tagihan yang dibuat pada periode ini",
    color: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  terkumpul: {
    title: "Terkumpul",
    description: "Pembayaran yang diterima pada periode ini",
    color: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  "belum-lunas": {
    title: "Belum Lunas",
    description: "Tagihan yang masih outstanding pada periode ini",
    color: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  "collection-rate": {
    title: "Collection Rate",
    description: "Tingkat penagihan pada periode ini",
    color: "text-violet-600 dark:text-violet-400",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  kunjungan: {
    title: "Kunjungan",
    description: "Daftar kunjungan pada periode ini",
    color: "text-sky-600 dark:text-sky-400",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  pasien: {
    title: "Pasien",
    description: "Daftar pasien unik pada periode ini",
    color: "text-pink-600 dark:text-pink-400",
    badgeClass: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  },
}

const STATUS_BADGE: Record<string, string> = {
  Lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Sebagian: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Menunggu: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
}

interface KpiDetailSheetProps {
  kpi: KpiKey | null
  open: boolean
  onOpenChange: (o: boolean) => void
  filters: ReportFilters
  summary: ReportSummary
}

export function KpiDetailSheet({ kpi, open, onOpenChange, filters, summary }: KpiDetailSheetProps) {
  const [detail, setDetail] = useState<KpiDetailData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !kpi || kpi === "collection-rate") return
    let cancelled = false
    setDetail(null)
    setLoading(true)
    const params = new URLSearchParams({ kpi, dateFrom: filters.dateFrom, dateTo: filters.dateTo })
    fetch(`/api/reports/financial/detail?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled) setDetail(res.data ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, kpi, filters])

  const meta = kpi ? KPI_META[kpi] : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        {meta && (
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle className={cn("text-lg font-semibold", meta.color)}>
              {meta.title}
            </SheetTitle>
            <SheetDescription>{meta.description}</SheetDescription>
            <p className="text-muted-foreground text-xs">
              {filters.dateFrom} — {filters.dateTo}
            </p>
          </SheetHeader>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {kpi === "collection-rate" && meta ? (
            <CollectionRateView summary={summary} meta={meta} />
          ) : loading ? (
            <LoadingSkeleton />
          ) : detail && kpi && meta ? (
            <DetailTable kpi={kpi} detail={detail} meta={meta} />
          ) : (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              Gagal memuat data
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CollectionRateView({
  summary,
  meta,
}: {
  summary: ReportSummary
  meta: (typeof KPI_META)[KpiKey]
}) {
  const rate = summary.collectionRate
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-xl border p-6 text-center">
        <p className={cn("font-mono text-5xl font-bold tracking-tight", meta.color)}>{rate}%</p>
        <p className="text-muted-foreground mt-1 text-sm">Collection Rate</p>
      </div>
      <div className="space-y-3">
        <Row
          label="Total Ditagihkan"
          value={formatCurrency(summary.totalBilled)}
          className="text-blue-600 dark:text-blue-400"
        />
        <Row
          label="Total Terkumpul"
          value={formatCurrency(summary.totalCollected)}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <Row
          label="Belum Lunas"
          value={formatCurrency(summary.outstanding)}
          className="text-amber-600 dark:text-amber-400"
        />
        <div className="border-t pt-3">
          <p className="text-muted-foreground mb-1 text-xs">Formula</p>
          <p className="font-mono text-sm">
            (Terkumpul ÷ Total Tagihan) × 100 = <span className={meta.color}>{rate}%</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold", className)}>{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}

function DetailTable({
  kpi,
  detail,
  meta,
}: {
  kpi: KpiKey
  detail: KpiDetailData
  meta: (typeof KPI_META)[KpiKey]
}) {
  const { items, total } = detail

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
        Tidak ada data
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Menampilkan {items.length} dari {total} data
        </p>
        <Badge variant="outline" className={cn("text-xs", meta.badgeClass)}>
          {total} total
        </Badge>
      </div>

      <div className="space-y-2">
        {kpi === "terkumpul" &&
          (items as KpiDetailPayment[]).map((item) => <PaymentRow key={item.id} item={item} />)}
        {(kpi === "total-tagihan" || kpi === "belum-lunas") &&
          (items as KpiDetailBilling[]).map((item) => <BillingRow key={item.id} item={item} />)}
        {kpi === "kunjungan" &&
          (items as KpiDetailVisit[]).map((item) => <VisitRow key={item.id} item={item} />)}
        {kpi === "pasien" &&
          (items as KpiDetailPatient[]).map((item) => <PatientRow key={item.id} item={item} />)}
      </div>
    </div>
  )
}

function PaymentRow({ item }: { item: KpiDetailPayment }) {
  return (
    <div className="bg-card rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.patientName}</p>
          <p className="text-muted-foreground text-xs">
            {item.mrNumber} · {item.visitNumber} · {item.visitType}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(item.amount)}
          </p>
          <p className="text-muted-foreground text-xs">{item.paymentMethod}</p>
        </div>
      </div>
      <p className="text-muted-foreground/60 mt-1 text-[10px]">
        {new Date(item.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  )
}

function BillingRow({ item }: { item: KpiDetailBilling }) {
  return (
    <div className="bg-card rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.patientName}</p>
          <p className="text-muted-foreground text-xs">
            {item.mrNumber} · {item.visitNumber} · {item.visitType}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(item.totalAmount)}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "mt-0.5 h-5 border-0 px-1.5 text-[10px]",
              STATUS_BADGE[item.paymentStatus] ??
                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {item.paymentStatus}
          </Badge>
        </div>
      </div>
      <p className="text-muted-foreground/60 mt-1 text-[10px]">
        {new Date(item.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  )
}

function VisitRow({ item }: { item: KpiDetailVisit }) {
  return (
    <div className="bg-card rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.patientName}</p>
          <p className="text-muted-foreground text-xs">
            {item.mrNumber} · {item.visitNumber}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {item.totalAmount != null && (
            <p className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
              {formatCurrency(item.totalAmount)}
            </p>
          )}
          <p className="text-muted-foreground text-xs">{item.visitType}</p>
        </div>
      </div>
      <p className="text-muted-foreground/60 mt-1 text-[10px]">
        {new Date(item.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  )
}

function PatientRow({ item }: { item: KpiDetailPatient }) {
  return (
    <div className="bg-card rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.name}</p>
          <p className="text-muted-foreground text-xs">{item.mrNumber}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-xs font-semibold text-pink-600 dark:text-pink-400">
            {formatCurrency(item.totalSpent)}
          </p>
          <p className="text-muted-foreground text-xs">{item.visitCount} kunjungan</p>
        </div>
      </div>
      {item.lastVisit && (
        <p className="text-muted-foreground/60 mt-1 text-[10px]">
          Terakhir:{" "}
          {new Date(item.lastVisit).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  )
}
