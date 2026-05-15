"use client"

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IconTrash, IconEdit } from "@tabler/icons-react"
import { ResultService } from "@/types/services"
import { formatCurrency } from "@/lib/billing/billing-utils"

interface ServicesTableProps {
  service: ResultService[]
  onDelete?: (serviceId: string) => void
  onEdit: (service: ResultService) => void
}

export function ServicesTable({ service, onEdit, onDelete }: ServicesTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Kode</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Tipe</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Deskripsi
            </TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Harga
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {service.map((s) => (
            <TableRow key={s.id} className="group transition-colors">
              <TableCell className="py-3 font-medium">{s.name}</TableCell>
              <TableCell className="py-3">
                <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {s.code}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">{s.serviceType}</TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">
                {s.category || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate py-3 text-sm">
                {s.description || "—"}
              </TableCell>
              <TableCell className="py-3 text-right">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(Number(s.price))}
                </span>
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(s)}
                      >
                        <IconEdit size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Service</TooltipContent>
                  </Tooltip>
                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-destructive h-7 w-7 p-0"
                          onClick={() => onDelete(s.id)}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hapus Service</TooltipContent>
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
