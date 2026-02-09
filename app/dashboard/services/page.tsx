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
import { toast } from "sonner"
import { ServicesTable } from "@/components/services/service-table"
import { PayloadServices, ResultService } from "@/types/services"
import { useService } from "@/hooks/use-service"
import { FormServiceDialog } from "@/components/services/form-service-dialog"
import { IconCirclePlus2, IconSearch } from "@tabler/icons-react"

export default function UsersPage() {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [mode, setMode] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ResultService | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

  const {
    services,
    createService,
    deleteService,
    fetchServices,
    refetch,
    updateService,
    isLoading,
    errorMessage,
    pagination,
    searchQuery,
    setSearchQuery,
    handlePageChange,
    getServiceById,
  } = useService()

  const handleEdit = async (service: ResultService) => {
    const updatedService = await getServiceById(service.id)
    if (updatedService) {
      setSelectedService(updatedService)
    } else {
      setSelectedService(service)
    }
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
      toast.error("Gagal menghapus services!")
    }
  }

  const formSubmit = async (mode: string, data: PayloadServices, id?: string) => {
    try {
      if (mode === "add") {
        await createService(data)
      } else if (mode === "edit" && id) {
        await updateService(id, data)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Services</h1>
          <p className="text-muted-foreground">Kelola Services</p>
        </div>
        <Button
          onClick={() => {
            setFormDialogOpen(true)
            setMode("add")
          }}
        >
          <IconCirclePlus2 size={20} className="mr-2" />
          Tambah Services
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Services</CardTitle>
          {pagination.total > 0 && !isLoading && (
            <CardDescription>Total: {pagination.total} Services</CardDescription>
          )}
          <CardAction>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
                  size={20}
                />
                <Input
                  placeholder="Cari berdasarkan nama, tipe, kategori atau kode"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-w-[304px] pl-10"
                />
              </div>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          {isLoading && services.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">Memuat data Service ...</div>
          ) : (
            <ServicesTable service={services} onEdit={handleEdit} onDelete={handleDelete} />
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

      <FormServiceDialog
        data={selectedService}
        error={errorMessage}
        open={formDialogOpen}
        mode={mode}
        onOpenChange={setFormDialogOpen}
        onSubmit={formSubmit}
      />

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
