"use client"

import Link from "next/link"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import {
  ArrowLeft,
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  CalendarIcon,
} from "lucide-react"
import { PageGuard } from "@/components/auth/page-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useOpnameHistory, type DirectionFilter } from "@/hooks/use-opname-history"
import type { OpnameHistoryItem } from "@/app/api/pharmacy/stok-opname/history/route"

export default function OpnameHistoryPage() {
  return (
    <PageGuard permissions={["pharmacy:manage_inventory"]}>
      <HistoryContent />
    </PageGuard>
  )
}

function HistoryContent() {
  const {
    displayItems,
    pagination,
    stats,
    isLoading,
    page,
    search,
    dateFrom,
    dateTo,
    direction,
    hasFilters,
    setPage,
    setSearch,
    setDateFrom,
    setDateTo,
    setDirection,
    refresh,
    clearFilters,
  } = useOpnameHistory()

  return (
    <div className="container mx-auto max-w-5xl space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
            <Link href="/dashboard/pharmacy/stok-opname">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div className="bg-border h-4 w-px" />
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <History className="text-primary h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg leading-none font-semibold tracking-tight">Riwayat Opname</h1>
              <p className="text-muted-foreground mt-0.5 text-xs">Catatan penyesuaian stok</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap items-center gap-2">
        <StatChip label="Total Catatan" value={stats.total} />
        <StatChip
          label="Bertambah"
          value={stats.increased}
          suffix="di halaman ini"
          variant="positive"
        />
        <StatChip
          label="Berkurang"
          value={stats.decreased}
          suffix="di halaman ini"
          variant="negative"
        />
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-xl border p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Cari nama obat atau batch…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/50 h-8 border-0 pl-8 text-sm focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <DatePicker
              value={dateFrom}
              placeholder="Dari tanggal"
              onChange={(d) => {
                setDateFrom(d)
                setPage(1)
              }}
              disabledFn={(d) => d > new Date() || (dateTo ? d > parseISO(dateTo) : false)}
            />
            <span className="text-muted-foreground text-xs">—</span>
            <DatePicker
              value={dateTo}
              placeholder="Sampai tanggal"
              onChange={(d) => {
                setDateTo(d)
                setPage(1)
              }}
              disabledFn={(d) => d > new Date() || (dateFrom ? d < parseISO(dateFrom) : false)}
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground h-8 shrink-0 px-2"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        <div className="mt-3 border-t pt-3">
          <DirectionControl value={direction} onChange={setDirection} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="py-2.5 pl-4 font-medium">Tanggal</TableHead>
                <TableHead className="font-medium">Nama Obat</TableHead>
                <TableHead className="font-medium">Batch</TableHead>
                <TableHead className="text-right font-medium">Penyesuaian</TableHead>
                <TableHead className="font-medium">Keterangan</TableHead>
                <TableHead className="pr-4 font-medium">Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : displayItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState hasFilters={hasFilters || direction !== "all"} />
                  </TableCell>
                </TableRow>
              ) : (
                displayItems.map((item) => <HistoryRow key={item.id} item={item} />)
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-xs">
              {pagination.total} catatan
              {pagination.totalPages > 1 &&
                ` · Halaman ${pagination.page} dari ${pagination.totalPages}`}
            </p>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <PageNumbers
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page >= pagination.totalPages || isLoading}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DatePicker({
  value,
  placeholder,
  onChange,
  disabledFn,
}: {
  value: string
  placeholder: string
  onChange: (v: string) => void
  disabledFn: (d: Date) => boolean
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-36 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
          {value ? format(parseISO(value), "dd MMM yyyy", { locale: id }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? parseISO(value) : undefined}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          captionLayout="dropdown"
          disabled={disabledFn}
        />
      </PopoverContent>
    </Popover>
  )
}

function DirectionControl({
  value,
  onChange,
}: {
  value: DirectionFilter
  onChange: (v: DirectionFilter) => void
}) {
  const tabs: { value: DirectionFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "increase", label: "↑ Bertambah" },
    { value: "decrease", label: "↓ Berkurang" },
  ]
  return (
    <div className="bg-muted/50 inline-flex rounded-lg p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-all duration-150",
            value === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function HistoryRow({ item }: { item: OpnameHistoryItem }) {
  const isPositive = item.quantity > 0
  return (
    <TableRow
      className={cn(
        "group hover:bg-muted/20 border-l-2 transition-colors",
        isPositive
          ? "border-l-emerald-400/60 hover:border-l-emerald-400"
          : "border-l-red-400/60 hover:border-l-red-400"
      )}
    >
      <TableCell className="py-3 pl-4">
        <div className="text-sm font-medium tabular-nums">
          {new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="text-muted-foreground mt-0.5 font-mono text-[11px]">
          {new Date(item.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">{item.drugName}</span>
      </TableCell>
      <TableCell>
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{item.batchNumber}</code>
      </TableCell>
      <TableCell className="text-right">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-sm font-semibold",
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {isPositive ? "+" : ""}
          {item.quantity.toLocaleString("id-ID")}
          <span className="text-muted-foreground text-[11px] font-normal">{item.unit}</span>
        </span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">{item.reason || "—"}</span>
      </TableCell>
      <TableCell className="pr-4">
        {item.performedByName ? (
          <Badge variant="secondary" className="text-xs font-normal">
            {item.performedByName}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function StatChip({
  label,
  value,
  suffix,
  variant = "neutral",
}: {
  label: string
  value: number
  suffix?: string
  variant?: "neutral" | "positive" | "negative"
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
        variant === "positive" &&
          "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
        variant === "negative" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
        variant === "neutral" && "bg-muted/50"
      )}
    >
      <span
        className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          variant === "positive" && "text-emerald-700 dark:text-emerald-400",
          variant === "negative" && "text-red-700 dark:text-red-400",
          variant === "neutral" && "text-foreground"
        )}
      >
        {value.toLocaleString("id-ID")}
      </span>
      <span className="text-muted-foreground text-xs">
        {label}
        {suffix && <span className="ml-1 opacity-60">{suffix}</span>}
      </span>
    </div>
  )
}

function PageNumbers({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("...")
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
      pages.push(i)
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }
  return (
    <>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="text-muted-foreground px-1 text-xs">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
    </>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3 pl-4">
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="pr-4">
            <Skeleton className="h-5 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
        <History className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="text-sm font-medium">Belum ada riwayat</p>
      <p className="text-muted-foreground mt-1 text-xs">
        {hasFilters
          ? "Tidak ada data sesuai filter yang dipilih."
          : "Penyesuaian stok akan tercatat di sini."}
      </p>
    </div>
  )
}
