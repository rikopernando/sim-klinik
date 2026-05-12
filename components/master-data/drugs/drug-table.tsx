"use client"

import { Pencil, FlaskConical, Pill, PackageX, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { InventoryItemRecord } from "@/types/drug"

interface DrugTableProps {
  items: InventoryItemRecord[]
  isLoading: boolean
  onEdit: (item: InventoryItemRecord) => void
  onToggleActive: (item: InventoryItemRecord) => void
}

export function DrugTable({ items, isLoading, onEdit, onToggleActive }: DrugTableProps) {
  if (isLoading && items.length === 0) return <SkeletonRows />

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-muted/50 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <PackageX className="text-muted-foreground h-7 w-7" />
        </div>
        <p className="text-foreground font-medium">Tidak ada data ditemukan</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Coba ubah filter atau tambahkan item baru
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-8 pl-0" />
            <TableHead className="py-3 text-xs font-semibold tracking-wider uppercase">
              Nama
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Satuan</TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Harga Resep
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Min. Stok
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Status</TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isDrug = item.itemType === "drug"
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group border-l-2 transition-colors",
                  isDrug
                    ? "border-l-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-950/20"
                    : "border-l-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20",
                  !item.isActive && "opacity-50"
                )}
              >
                {/* Type icon column */}
                <TableCell className="w-8 pr-0 pl-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      isDrug
                        ? "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    )}
                  >
                    {isDrug ? (
                      <Pill className="h-3.5 w-3.5" />
                    ) : (
                      <FlaskConical className="h-3.5 w-3.5" />
                    )}
                  </div>
                </TableCell>

                {/* Name */}
                <TableCell className="py-3">
                  <div className="leading-tight font-medium">{item.name}</div>
                  {item.genericName && (
                    <div className="text-muted-foreground mt-0.5 text-xs italic">
                      {item.genericName}
                    </div>
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  {item.category ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        isDrug
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      )}
                    >
                      {item.category}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* Unit */}
                <TableCell>
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                    {item.unit}
                  </span>
                </TableCell>

                {/* Price */}
                <TableCell className="text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {formatCurrency(parseFloat(item.price))}
                  </span>
                </TableCell>

                {/* Min stock */}
                <TableCell className="text-center">
                  <span className="text-muted-foreground font-mono text-sm tabular-nums">
                    {item.minimumStock}
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
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-8 pl-0" />
            <TableHead className="py-3 text-xs font-semibold tracking-wider uppercase">
              Nama
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Satuan</TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Harga Resep
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Min. Stok
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Status</TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="border-l-2 border-l-transparent">
              <TableCell className="w-8 pr-0 pl-3">
                <Skeleton className="h-7 w-7 rounded-lg" />
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-1 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14 rounded" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-24" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-8" />
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
