"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/inpatient/room-utils"
import type { Room } from "@/types/rooms"

interface RoomListTableProps {
  rooms: Room[]
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
}

export function RoomListTable({ rooms, onEdit, onDelete }: RoomListTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              No. Kamar
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Tipe</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Lantai</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Gedung</TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Bed
            </TableHead>
            <TableHead className="text-center text-xs font-semibold tracking-wider uppercase">
              Tersedia
            </TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Tarif/Hari
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id} className="group transition-colors">
              <TableCell className="py-3">
                <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                  {room.roomNumber}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">{room.roomType}</TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">
                {room.floor || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">
                {room.building || "—"}
              </TableCell>
              <TableCell className="py-3 text-center font-mono text-sm">{room.bedCount}</TableCell>
              <TableCell className="py-3 text-center">
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    room.availableBeds > 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {room.availableBeds}
                </span>
              </TableCell>
              <TableCell className="py-3 text-right">
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(room.dailyRate)}
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
                        onClick={() => onEdit(room)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Kamar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-destructive h-7 w-7 p-0"
                        onClick={() => onDelete(room)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Hapus Kamar</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
