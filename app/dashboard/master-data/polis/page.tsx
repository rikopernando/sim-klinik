"use client"

import { useState } from "react"
import { IconCirclePlus2, IconLayoutGrid } from "@tabler/icons-react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/users/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditPolisDialog } from "@/components/polis/edit-polis-dialog"
import { CreatePolisDialog } from "@/components/polis/create-polis-dialog"
import { PolisTable } from "@/components/polis/polis-table"
import { usePoli } from "@/hooks/use-poli"
import { ResultPoli, PayloadPoli } from "@/types/poli"
import { toast } from "sonner"

export default function PolisPage() {
  return (
    <PageGuard roles={["super_admin", "admin"]}>
      <PolisPageContent />
    </PageGuard>
  )
}

function PolisPageContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPolis, setSelectedPolis] = useState<ResultPoli | null>(null)
  const [poliToDelete, setPoliToDelete] = useState<string | null>(null)

  const {
    polis,
    isLoading,
    isSearching,
    pagination,
    searchQuery,
    setSearchQuery,
    includeInactive,
    setIncludeInactive,
    handlePageChange,
    createPoli,
    updatePoli,
    deletePoli,
    errorMessage,
  } = usePoli()

  const handleEdit = (p: ResultPoli) => {
    setSelectedPolis(p)
    setEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPoliToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!poliToDelete) return
    const success = await deletePoli(poliToDelete)
    if (success) {
      setDeleteDialogOpen(false)
      setPoliToDelete(null)
      toast.success("Poli berhasil dihapus!")
    } else {
      toast.error("Gagal menghapus poli!")
    }
  }

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div>
      <PageHeader title="Manajemen Poli" description="Kelola data poli klinik">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconCirclePlus2 size={16} className="mr-1.5" />
          Tambah Poli
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama atau kode poli..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-inactive"
              checked={includeInactive}
              onCheckedChange={(v) => setIncludeInactive(Boolean(v))}
            />
            <label
              htmlFor="include-inactive"
              className="text-muted-foreground cursor-pointer text-sm"
            >
              Tampilkan nonaktif
            </label>
          </div>
          {!isLoading && pagination.total > 0 && (
            <p className="text-muted-foreground ml-auto shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              poli
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Poli"
          total={pagination.total}
          isLoading={polis.length === 0 && isLoading}
          loadingMessage="Memuat data poli..."
          isEmpty={polis.length === 0 && !isLoading}
          emptyIcon={<IconLayoutGrid size={22} className="text-[#52b788]" />}
          emptyTitle={searchQuery ? "Poli tidak ditemukan" : "Belum ada data poli"}
          emptyDescription={
            searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : "Mulai dengan menambahkan poli baru"
          }
          emptyAction={
            !searchQuery ? (
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <IconCirclePlus2 size={14} className="mr-1.5" />
                Tambah Poli
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} poli`
              : undefined
          }
          pagination={
            pagination.totalPages > 1 ? (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            ) : undefined
          }
        >
          <PolisTable polis={polis} onEdit={handleEdit} onDelete={handleDelete} />
        </TablePanel>
      </div>

      <CreatePolisDialog
        error={errorMessage}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (payload: PayloadPoli) => {
          await createPoli(payload)
        }}
      />

      <EditPolisDialog
        polis={selectedPolis}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {}}
        onSubmit={async (id: string, payload: PayloadPoli) => {
          await updatePoli(id, payload)
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Poli?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Poli akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
