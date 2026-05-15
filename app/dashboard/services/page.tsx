"use client"

import { useState } from "react"
import { IconTool } from "@tabler/icons-react"
import { Package } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
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
import { ServicesTable } from "@/components/services/service-table"
import { FormServiceDialog } from "@/components/services/form-service-dialog"
import { useService } from "@/hooks/use-service"
import { PayloadServices, ResultService } from "@/types/services"
import { toast } from "sonner"

export default function ServicePage() {
  const [mode, setMode] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ResultService | null>(null)

  const {
    services,
    isLoading,
    isSearching,
    pagination,
    searchQuery,
    errorMessage,
    updateService,
    createService,
    deleteService,
    setSearchQuery,
    getServiceById,
    handlePageChange,
  } = useService()

  const handleEdit = async (service: ResultService) => {
    const updated = await getServiceById(service.id)
    setSelectedService(updated ?? service)
    setFormDialogOpen(true)
    setMode("edit")
  }

  const handleDelete = (id: string) => {
    setServiceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!serviceToDelete) return
    const success = await deleteService(serviceToDelete)
    if (success) {
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
      toast.success("Service berhasil dihapus!")
    } else {
      toast.error("Gagal menghapus service!")
    }
  }

  const formSubmit = async (m: string, data: PayloadServices, id?: string) => {
    try {
      if (m === "add") await createService(data)
      else if (m === "edit" && id) await updateService(id, data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div>
      <PageHeader title="Manajemen Services" description="Kelola tarif dan layanan klinik">
        <Button
          onClick={() => {
            setFormDialogOpen(true)
            setMode("add")
          }}
        >
          <IconTool size={16} className="mr-1.5" />
          Tambah Service
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama, tipe, kategori atau kode..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          {!isLoading && pagination.total > 0 && (
            <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              service
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Services"
          total={pagination.total}
          isLoading={services.length === 0 && isLoading}
          loadingMessage="Memuat data service..."
          isEmpty={services.length === 0 && !isLoading}
          emptyIcon={<Package size={22} className="text-[#52b788]" />}
          emptyTitle={searchQuery ? "Service tidak ditemukan" : "Belum ada data service"}
          emptyDescription={
            searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : "Mulai dengan menambahkan service baru"
          }
          emptyAction={
            !searchQuery ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormDialogOpen(true)
                  setMode("add")
                }}
              >
                <IconTool size={14} className="mr-1.5" />
                Tambah Service
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} service`
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
          <ServicesTable service={services} onEdit={handleEdit} onDelete={handleDelete} />
        </TablePanel>
      </div>

      <FormServiceDialog
        data={selectedService}
        error={errorMessage}
        open={formDialogOpen}
        mode={mode}
        onOpenChange={setFormDialogOpen}
        onSubmit={formSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Service?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Service akan dihapus permanen dari sistem.
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
