"use client"

/**
 * Room List Table Component
 * Displays list of rooms in a table format with actions
 */

import { memo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Room } from "@/types/rooms"
import Loader from "@/components/loader"
import { formatCurrency } from "@/lib/inpatient/room-utils"

interface RoomListTableProps {
  rooms: Room[]
  isLoading: boolean
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
}

function RoomListTableComponent({ rooms, isLoading, onEdit, onDelete }: RoomListTableProps) {
  if (isLoading) {
    return <Loader message="Memuat data kamar..." />
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Belum ada data kamar</p>
        <p className="text-muted-foreground text-sm">
          Klik tombol &quot;Tambah Kamar&quot; untuk menambahkan kamar baru
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nomor Kamar</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Lantai</TableHead>
          <TableHead>Gedung</TableHead>
          <TableHead className="text-center">Bed</TableHead>
          <TableHead className="text-center">Tersedia</TableHead>
          <TableHead className="text-right">Tarif/Hari</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-medium">{room.roomNumber}</TableCell>
            <TableCell>{room.roomType}</TableCell>
            <TableCell>{room.floor || "-"}</TableCell>
            <TableCell>{room.building || "-"}</TableCell>
            <TableCell className="text-center">{room.bedCount}</TableCell>
            <TableCell className="text-center">
              <span
                className={
                  room.availableBeds > 0 ? "font-medium text-green-600" : "font-medium text-red-600"
                }
              >
                {room.availableBeds}
              </span>
            </TableCell>
            <TableCell className="text-right">{formatCurrency(room.dailyRate)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(room)} title="Edit kamar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(room)}
                  title="Hapus kamar"
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Export memoized version for better performance
export const RoomListTable = memo(RoomListTableComponent)
