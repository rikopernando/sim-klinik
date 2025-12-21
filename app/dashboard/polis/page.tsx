/**
 * Polis Management Page
 */

"use client"

import { useState } from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { IconCirclePlus2, IconSearch } from "@tabler/icons-react"
import { PolisTable } from "@/components/polis/polis-table"
import { toast } from "sonner"
import { usePoli } from "@/hooks/use-poli"
import { ResultPoli, PayloadPoli } from "@/types/poli"
import { EditPolisDialog } from "@/components/polis/edit-polis-dialog"
import { CreatePolisDialog } from "@/components/polis/create-polis-dialog"

export default function UsersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPolis, setSelectedPolis] = useState<ResultPoli | null>(null)
  const [poliToDelete, setPoliToDelete] = useState<string | null>(null)

  const {
    polis,
    createPoli,
    updatePoli,
    deletePoli,
    isLoading,
    errorMessage,
    pagination,
    searchQuery,
    setSearchQuery,
    includeInactive,
    setIncludeInactive,
    handlePageChange,
  } = usePoli()

  const handleEdit = (polis: ResultPoli) => {
    setSelectedPolis(polis)
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

  const handleSuccess = () => {}

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Poli</h1>
          <p className="text-muted-foreground">Kelola Poli</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconCirclePlus2 size={20} className="mr-2" />
          Tambah Poli
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Polis</CardTitle>
          {pagination.total > 0 && !isLoading && (
            <CardDescription>Total: {pagination.total} polis</CardDescription>
          )}
          <CardAction>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
                  size={20}
                />
                <Input
                  placeholder="Cari berdasarkan nama atau kode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-w-[304px] pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(v) => setIncludeInactive(Boolean(v))}
                  />
                  <label htmlFor="include-inactive" className="muted-foreground text-sm">
                    Tampilkan non-aktif
                  </label>
                </div>
              </div>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          {isLoading && polis.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">Memuat data polis...</div>
          ) : (
            <PolisTable polis={polis} onEdit={handleEdit} onDelete={handleDelete} />
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Polis Dialog */}
      <CreatePolisDialog
        error={errorMessage}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={async (payload: PayloadPoli) => {
          await createPoli(payload)
        }}
      />

      {/* Edit Polis Dialog */}
      <EditPolisDialog
        polis={selectedPolis}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
        onSubmit={async (id: string, payload: PayloadPoli) => {
          await updatePoli(id, payload)
        }}
      />

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
