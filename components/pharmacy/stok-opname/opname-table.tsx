"use client"

import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  PackageSearch,
  Filter,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"
import type { Pagination } from "@/types/api"
import type { ChangeEntry, ChangesMap } from "@/hooks/use-stok-opname"
import { OPNAME_PAGE_LIMIT } from "@/hooks/use-stok-opname"

interface OpnameTableProps {
  displayRows: DrugInventoryWithDetails[]
  changesMap: ChangesMap
  changedEntries: ChangeEntry[]
  pagination: Pagination
  isLoading: boolean
  isSaving: boolean
  isSessionActive: boolean
  showOnlyChanged: boolean
  search: string
  debouncedSearch: string
  totalChanged: number
  page: number
  onSearchChange: (value: string) => void
  onShowOnlyChangedToggle: () => void
  onRefresh: () => void
  onPageChange: (p: number) => void
  onActualChange: (id: string, value: string, row: DrugInventoryWithDetails) => void
  onSetZero: (row: DrugInventoryWithDetails) => void
  getDisplayValue: (row: DrugInventoryWithDetails) => string
}

export function OpnameTable({
  displayRows,
  changesMap,
  changedEntries,
  pagination,
  isLoading,
  isSaving,
  isSessionActive,
  showOnlyChanged,
  search,
  debouncedSearch,
  totalChanged,
  page,
  onSearchChange,
  onShowOnlyChangedToggle,
  onRefresh,
  onPageChange,
  onActualChange,
  onSetZero,
  getDisplayValue,
}: OpnameTableProps) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Cari nama obat atau nomor batch…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={showOnlyChanged}
            className="bg-muted/40 h-9 border-0 pl-9 focus-visible:ring-1"
          />
        </div>
        <Button
          variant={showOnlyChanged ? "default" : "outline"}
          size="sm"
          onClick={onShowOnlyChangedToggle}
          disabled={!isSessionActive && !showOnlyChanged}
          className="shrink-0"
        >
          {showOnlyChanged ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
          <span className="ml-1.5">{showOnlyChanged ? "Semua" : "Hanya Berubah"}</span>
          {!showOnlyChanged && totalChanged > 0 && (
            <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">
              {totalChanged}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isSaving || showOnlyChanged}
          className="shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="py-3 pl-4 font-medium">Nama Obat</TableHead>
              <TableHead className="font-medium">Batch</TableHead>
              <TableHead className="font-medium">Satuan</TableHead>
              <TableHead className="font-medium">Kadaluarsa</TableHead>
              <TableHead className="text-right font-medium">Stok Sistem</TableHead>
              <TableHead className="text-right font-medium">Jumlah Aktual</TableHead>
              <TableHead className="font-medium"></TableHead>
              <TableHead className="pr-4 text-right font-medium">Selisih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !showOnlyChanged ? (
              <SkeletonRows />
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState search={debouncedSearch} showOnlyChanged={showOnlyChanged} />
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <OpnameRow
                  key={row.id}
                  row={row}
                  displayVal={getDisplayValue(row)}
                  hasChange={changesMap[row.id] !== undefined}
                  isEditable={isSessionActive}
                  onActualChange={onActualChange}
                  onSetZero={onSetZero}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <TableFooter
        showOnlyChanged={showOnlyChanged}
        isLoading={isLoading}
        pagination={pagination}
        page={page}
        changedCount={changedEntries.length}
        onPageChange={onPageChange}
      />
    </div>
  )
}

// ── Row ──────────────────────────────────────────────────────────────────────

interface OpnameRowProps {
  row: DrugInventoryWithDetails
  displayVal: string
  hasChange: boolean
  isEditable: boolean
  onActualChange: (id: string, value: string, row: DrugInventoryWithDetails) => void
  onSetZero: (row: DrugInventoryWithDetails) => void
}

function OpnameRow({
  row,
  displayVal,
  hasChange,
  isEditable,
  onActualChange,
  onSetZero,
}: OpnameRowProps) {
  const actual = displayVal === "" ? row.stockQuantity : parseInt(displayVal, 10)
  const diff = isNaN(actual) ? 0 : actual - row.stockQuantity
  const expiryColors = getExpiryAlertColor(row.expiryAlertLevel)

  return (
    <TableRow
      className={cn(
        "group transition-colors",
        hasChange
          ? "border-l-2 border-l-amber-400 bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
          : "hover:bg-muted/30"
      )}
    >
      <TableCell className="py-3 pl-4">
        <div className="font-medium">{row.drug.name}</div>
        {row.drug.genericName && (
          <div className="text-muted-foreground text-xs">{row.drug.genericName}</div>
        )}
      </TableCell>
      <TableCell>
        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{row.batchNumber}</span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{row.drug.unit}</TableCell>
      <TableCell>
        <span className={cn("text-xs", expiryColors.text)}>
          {formatExpiryDate(
            typeof row.expiryDate === "string"
              ? row.expiryDate
              : new Date(row.expiryDate).toISOString(),
            row.daysUntilExpiry
          )}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-mono text-sm">{row.stockQuantity.toLocaleString("id-ID")}</span>
      </TableCell>
      <TableCell className="text-right">
        <Input
          value={displayVal}
          onChange={(e) => onActualChange(row.id, e.target.value, row)}
          disabled={!isEditable}
          className={cn(
            "ml-auto h-8 w-24 text-right font-mono text-sm transition-colors",
            hasChange
              ? "border-amber-400 bg-white focus-visible:ring-amber-400 dark:bg-amber-950/20"
              : "bg-muted/30"
          )}
          inputMode="numeric"
        />
      </TableCell>
      <TableCell className="px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetZero(row)}
          disabled={!isEditable || row.stockQuantity === 0}
          className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
          title="Set ke 0 (Stok habis)"
        >
          Habis
        </Button>
      </TableCell>
      <TableCell className="pr-4 text-right">
        <DiffBadge diff={diff} hasChange={hasChange} />
      </TableCell>
    </TableRow>
  )
}

// ── Diff badge ────────────────────────────────────────────────────────────────

function DiffBadge({ diff, hasChange }: { diff: number; hasChange: boolean }) {
  if (!hasChange) return <Minus className="text-muted-foreground/40 ml-auto h-4 w-4" />
  if (diff === 0) return <span className="text-muted-foreground font-mono text-sm">±0</span>
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-sm font-semibold",
        diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      )}
    >
      {diff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {diff > 0 ? "+" : ""}
      {diff.toLocaleString("id-ID")}
    </span>
  )
}

// ── Table footer with pagination ───────────────────────────────────────────────

function TableFooter({
  showOnlyChanged,
  isLoading,
  pagination,
  page,
  changedCount,
  onPageChange,
}: {
  showOnlyChanged: boolean
  isLoading: boolean
  pagination: Pagination
  page: number
  changedCount: number
  onPageChange: (p: number) => void
}) {
  if (showOnlyChanged) {
    return (
      <div className="border-t px-4 py-3">
        <p className="text-muted-foreground text-sm">Menampilkan {changedCount} item yang diubah</p>
      </div>
    )
  }

  if (isLoading) return null

  if (pagination.totalPages <= 1) {
    return (
      <div className="border-t px-4 py-3">
        <p className="text-muted-foreground text-sm">{pagination.total} batch</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-muted-foreground text-sm">
        Halaman {pagination.page} dari {pagination.totalPages} · {pagination.total} batch
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <PageNumbers
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
          disabled={page >= pagination.totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Page numbers ──────────────────────────────────────────────────────────────

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
  if (totalPages <= 5) {
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
          <span key={`ellipsis-${i}`} className="text-muted-foreground px-1 text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0 text-xs"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
    </>
  )
}

// ── Skeleton & empty state ────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: OPNAME_PAGE_LIMIT }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3 pl-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-24" />
          </TableCell>
          <TableCell />
          <TableCell className="pr-4 text-right">
            <Skeleton className="ml-auto h-4 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function EmptyState({ search, showOnlyChanged }: { search: string; showOnlyChanged: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <PackageSearch className="text-muted-foreground h-7 w-7" />
      </div>
      <p className="font-medium">
        {showOnlyChanged
          ? "Belum ada perubahan"
          : search
            ? `Tidak ada hasil untuk "${search}"`
            : "Belum ada data stok"}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        {showOnlyChanged
          ? "Edit jumlah aktual pada baris di tabel untuk mulai mencatat selisih."
          : search
            ? "Coba kata kunci lain."
            : "Tambahkan stok obat terlebih dahulu."}
      </p>
    </div>
  )
}
