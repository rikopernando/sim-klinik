/**
 * Polis Table Component
 * Displays Polis in a table with actions
 */

"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
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
import { IconTrash, IconEdit } from "@tabler/icons-react"
import { ResultPoli } from "@/types/poli"

interface PolisTableProps {
  polis: ResultPoli[]
  onEdit: (polis: ResultPoli) => void
  onDelete?: (polisId: string) => void
}

export function PolisTable({ polis, onEdit, onDelete }: PolisTableProps) {
  if (polis.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">Tidak ada polis ditemukan</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Kode</TableHead>
          <TableHead>Deskirpsi</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Terdaftar</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {polis.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>{p.code}</TableCell>
            <TableCell>{p.description}</TableCell>
            <TableCell>
              {p.isActive === "active" ? (
                <Badge className={`text-white`}>{p.isActive}</Badge>
              ) : (
                <Badge variant="destructive">{p.isActive}</Badge>
              )}
            </TableCell>
            <TableCell>{format(new Date(p.createdAt), "dd MMM yyyy")}</TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <div className="flex justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                        <IconEdit size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit polis</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDelete && onDelete(p.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hapus polis</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
