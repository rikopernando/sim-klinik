"use client"

import { Pencil, LayoutList, PackageX, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { LabPanelRecord } from "@/types/lab-panel"

const deptBadgeClass = (department: string) =>
  department === "LAB"
    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"

function PanelTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead className="w-8 pl-0" />
        <TableHead className="py-3 text-xs font-semibold tracking-wider uppercase">Kode</TableHead>
        <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
        <TableHead className="text-xs font-semibold tracking-wider uppercase">
          Pemeriksaan
        </TableHead>
        <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
          Harga
        </TableHead>
        <TableHead className="text-xs font-semibold tracking-wider uppercase">Status</TableHead>
        <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
          Aksi
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

interface LabPanelTableProps {
  items: LabPanelRecord[]
  isLoading: boolean
  onEdit: (item: LabPanelRecord) => void
  onToggleActive: (item: LabPanelRecord) => void
}

export function LabPanelTable({ items, isLoading, onEdit, onToggleActive }: LabPanelTableProps) {
  if (isLoading && items.length === 0) return <SkeletonRows />

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-muted/50 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <PackageX className="text-muted-foreground h-7 w-7" />
        </div>
        <p className="text-foreground font-medium">Tidak ada data ditemukan</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Coba ubah filter atau tambahkan panel baru
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <PanelTableHeader />
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                "group border-l-2 border-l-indigo-400 transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20",
                !item.isActive && "opacity-50"
              )}
            >
              {/* Icon */}
              <TableCell className="w-8 pr-0 pl-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <LayoutList className="h-3.5 w-3.5" />
                </div>
              </TableCell>

              {/* Code */}
              <TableCell className="py-3">
                <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {item.code}
                </span>
              </TableCell>

              {/* Name + description */}
              <TableCell className="py-3">
                <div className="leading-tight font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-muted-foreground mt-0.5 max-w-xs truncate text-xs">
                    {item.description}
                  </div>
                )}
              </TableCell>

              {/* Tests */}
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.tests && item.tests.length > 0 ? (
                    <>
                      {item.tests.slice(0, 3).map((t) => (
                        <Badge
                          key={t.id}
                          variant="secondary"
                          className={cn("text-xs", deptBadgeClass(t.department))}
                        >
                          {t.code}
                        </Badge>
                      ))}
                      {item.tests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tests.length - 3}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {item.testCount ?? 0} pemeriksaan
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Price */}
              <TableCell className="text-right">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(parseFloat(item.price))}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    item.isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"
                    )}
                  />
                  {item.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="pr-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0",
                      item.isActive
                        ? "text-muted-foreground hover:text-destructive"
                        : "text-muted-foreground hover:text-emerald-600"
                    )}
                    onClick={() => onToggleActive(item)}
                    title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {item.isActive ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <PanelTableHeader />
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-l-2 border-l-transparent">
              <TableCell className="w-8 pr-0 pl-3">
                <Skeleton className="h-7 w-7 rounded-lg" />
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-5 w-24 rounded" />
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1 h-3 w-28" />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="pr-4" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
