"use client"

import { Pencil, FlaskConical, Radiation, PackageX, ToggleLeft, ToggleRight } from "lucide-react"
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
import type { LabTestRecord } from "@/types/lab-test"

interface LabTestTableProps {
  items: LabTestRecord[]
  isLoading: boolean
  onEdit: (item: LabTestRecord) => void
  onToggleActive: (item: LabTestRecord) => void
}

export function LabTestTable({ items, isLoading, onEdit, onToggleActive }: LabTestTableProps) {
  if (isLoading && items.length === 0) return <SkeletonRows />

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-muted/50 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <PackageX className="text-muted-foreground h-7 w-7" />
        </div>
        <p className="text-foreground font-medium">Tidak ada data ditemukan</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Coba ubah filter atau tambahkan pemeriksaan baru
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
              Kode
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Dept</TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Harga
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              TAT
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Puasa
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Status</TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLab = item.department === "LAB"
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group border-l-2 transition-colors",
                  isLab
                    ? "border-l-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                    : "border-l-violet-400 hover:bg-violet-50/40 dark:hover:bg-violet-950/20",
                  !item.isActive && "opacity-50"
                )}
              >
                {/* Dept icon */}
                <TableCell className="w-8 pr-0 pl-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      isLab
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                        : "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400"
                    )}
                  >
                    {isLab ? (
                      <FlaskConical className="h-3.5 w-3.5" />
                    ) : (
                      <Radiation className="h-3.5 w-3.5" />
                    )}
                  </div>
                </TableCell>

                {/* Code */}
                <TableCell className="py-3">
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                    {item.code}
                  </span>
                </TableCell>

                {/* Name */}
                <TableCell className="py-3">
                  <div className="leading-tight font-medium">{item.name}</div>
                  {item.specimenType && (
                    <div className="text-muted-foreground mt-0.5 text-xs italic">
                      {item.specimenType}
                    </div>
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  {item.category ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                        isLab
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      )}
                    >
                      {item.category}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                {/* Department */}
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      isLab
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    )}
                  >
                    {item.department}
                  </span>
                </TableCell>

                {/* Price */}
                <TableCell className="text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {formatCurrency(parseFloat(item.price))}
                  </span>
                </TableCell>

                {/* TAT */}
                <TableCell className="text-center">
                  <span className="text-muted-foreground font-mono text-sm tabular-nums">
                    {item.tatHours ?? 24}j
                  </span>
                </TableCell>

                {/* Fasting */}
                <TableCell className="text-center">
                  {item.requiresFasting ? (
                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Ya
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
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
              Kode
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Dept</TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Harga
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              TAT
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Puasa
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
                <Skeleton className="h-5 w-20 rounded" />
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-1 h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-24" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-8" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-5 w-8 rounded-full" />
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
