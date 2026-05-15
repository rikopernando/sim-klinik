"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { IconTrash, IconEdit } from "@tabler/icons-react"
import { ResultPoli } from "@/types/poli"

interface PolisTableProps {
  polis: ResultPoli[]
  onEdit: (polis: ResultPoli) => void
  onDelete?: (polisId: string) => void
}

function StatusBadge({ isActive }: { isActive: string }) {
  const active = isActive === "active"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-muted-foreground/50"
        )}
      />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  )
}

export function PolisTable({ polis, onEdit, onDelete }: PolisTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Kode</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Deskripsi
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Status</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Terdaftar
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {polis.map((p) => (
            <TableRow key={p.id} className="group transition-colors">
              <TableCell className="py-3 font-medium">{p.name}</TableCell>
              <TableCell className="py-3">
                <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {p.code}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate py-3 text-sm">
                {p.description || "—"}
              </TableCell>
              <TableCell className="py-3">
                <StatusBadge isActive={p.isActive} />
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">
                {format(new Date(p.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(p)}
                      >
                        <IconEdit size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Poli</TooltipContent>
                  </Tooltip>
                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-destructive h-7 w-7 p-0"
                          onClick={() => onDelete(p.id)}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hapus Poli</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
