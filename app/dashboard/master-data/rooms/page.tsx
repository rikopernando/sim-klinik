"use client"

/**
 * Master Data - Rooms Page
 * Manage hospital rooms (CRUD operations)
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Search } from "lucide-react"
import type { Room, RoomCreateInput } from "@/types/rooms"
import { useRoomFilters } from "@/hooks/use-room-filters"
import { useRoomsList } from "@/hooks/use-rooms-list"
import { useRoomMutations } from "@/hooks/use-room-mutations"
import { RoomListTable } from "@/components/master-data/rooms/room-list-table"
import { RoomFormDialog } from "@/components/master-data/rooms/room-form-dialog"
import { DeleteRoomAlert } from "@/components/master-data/rooms/delete-room-alert"
import { RoomsPagination } from "@/components/master-data/rooms/rooms-pagination"
import { ROOM_TYPE_FILTER_OPTIONS } from "@/lib/constants/rooms"

export default function RoomsPage() {
  // Use modular hooks
  const filterHook = useRoomFilters()
  const { rooms, isLoading, pagination, handlePageChange, refresh } = useRoomsList(
    filterHook.filters
  )
  const mutations = useRoomMutations(refresh)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

  // Handlers
  const handleCreate = () => {
    setFormMode("create")
    setSelectedRoom(null)
    setIsFormOpen(true)
  }

  const handleEdit = (room: Room) => {
    setFormMode("edit")
    setSelectedRoom(room)
    setIsFormOpen(true)
  }

  const handleDelete = (room: Room) => {
    setSelectedRoom(room)
    setIsDeleteAlertOpen(true)
  }

  const handleFormSubmit = async (data: RoomCreateInput) => {
    if (formMode === "create") {
      await mutations.create(data)
      setIsFormOpen(false)
    } else if (selectedRoom) {
      await mutations.update(selectedRoom.id, data)
      setIsFormOpen(false)
    }
  }

  const handleDeleteConfirm = async (roomId: string) => {
    await mutations.remove(roomId)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Data Kamar</h1>
            <p className="text-muted-foreground">Kelola data kamar rawat inap</p>
          </div>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Kamar
          </Button>
        </div>

        {/* Room List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kamar</CardTitle>
            <CardDescription>
              {isLoading
                ? "Memuat data..."
                : pagination.total > 0
                  ? `Total: ${pagination.total} kamar`
                  : "Tidak ada data kamar"}
            </CardDescription>
            <CardAction>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Cari nomor kamar"
                      value={filterHook.search}
                      onChange={(e) => filterHook.setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Room Type Filter */}
                <div>
                  <Select value={filterHook.roomType} onValueChange={filterHook.setRoomType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipe Kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPE_FILTER_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RoomListTable
              rooms={rooms}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <RoomsPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <RoomFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          room={selectedRoom}
          mode={formMode}
        />

        {/* Delete Alert */}
        <DeleteRoomAlert
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
          room={selectedRoom}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  )
}
