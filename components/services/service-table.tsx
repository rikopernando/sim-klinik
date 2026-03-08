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
import { ResultService } from "@/types/services"
import { IconTrash, IconEdit } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ServicesTableProps {
  service: ResultService[]
  onDelete?: (serviceId: string) => void
  onEdit: (service: ResultService) => void
}

export function ServicesTable({ service, onEdit, onDelete }: ServicesTableProps) {
  if (service.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">Tidak ada Service ditemukan</div>
    )
  }

  const formatRupiah = (price: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(price))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Kode</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {service.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.name}</TableCell>
            <TableCell>{s.code}</TableCell>
            <TableCell>{s.serviceType}</TableCell>
            <TableCell>{s.category}</TableCell>
            <TableCell>{s.description}</TableCell>
            <TableCell>{formatRupiah(s.price)}</TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <div className="flex justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onEdit(s)}>
                        <IconEdit size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Service</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDelete && onDelete(s.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hapus Service</p>
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
