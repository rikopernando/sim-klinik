"use client"

import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, BedDouble } from "lucide-react"
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
  return (
    <PageGuard roles={["super_admin", "admin"]}>
      <RoomsPageContent />
    </PageGuard>
  )
}

function RoomsPageContent() {
  const filterHook = useRoomFilters()
  const { rooms, isLoading, pagination, handlePageChange, refresh } = useRoomsList(
    filterHook.filters
  )
  const mutations = useRoomMutations(refresh)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)

  const isSearching = filterHook.search !== filterHook.debouncedSearch || isLoading

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

  const rangeStart =
    !pagination || pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  return (
    <div>
      <PageHeader title="Master Data Kamar" description="Kelola data kamar rawat inap">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Tambah Kamar
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <SearchInput
            value={filterHook.search}
            onChange={filterHook.setSearch}
            placeholder="Cari nomor kamar..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          <Select value={filterHook.roomType} onValueChange={filterHook.setRoomType}>
            <SelectTrigger className="w-44">
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
          {!isLoading && pagination && pagination.total > 0 && (
            <p className="text-muted-foreground ml-auto shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              kamar
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Kamar"
          total={pagination?.total}
          isLoading={rooms.length === 0 && isLoading}
          loadingMessage="Memuat data kamar..."
          isEmpty={rooms.length === 0 && !isLoading}
          emptyIcon={<BedDouble size={22} className="text-[#52b788]" />}
          emptyTitle={filterHook.search ? "Kamar tidak ditemukan" : "Belum ada data kamar"}
          emptyDescription={
            filterHook.search
              ? `Tidak ada hasil untuk "${filterHook.search}"`
              : "Mulai dengan menambahkan kamar baru"
          }
          emptyAction={
            !filterHook.search ? (
              <Button size="sm" variant="outline" onClick={handleCreate}>
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Tambah Kamar
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination && pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} kamar`
              : undefined
          }
          pagination={
            pagination && pagination.totalPages > 1 ? (
              <RoomsPagination pagination={pagination} onPageChange={handlePageChange} />
            ) : undefined
          }
        >
          <RoomListTable rooms={rooms} onEdit={handleEdit} onDelete={handleDelete} />
        </TablePanel>
      </div>

      <RoomFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        room={selectedRoom}
        mode={formMode}
      />

      <DeleteRoomAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        room={selectedRoom}
        onConfirm={async (roomId: string) => {
          await mutations.remove(roomId)
        }}
      />
    </div>
  )
}
