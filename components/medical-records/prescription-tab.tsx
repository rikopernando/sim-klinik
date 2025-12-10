"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

import { deletePrescription } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type Prescription } from "@/types/medical-record"
import { canEditMedicalRecord, canDeletePrescription } from "@/lib/utils/medical-record"

import { SectionCard } from "./section-card"
import { ListItem } from "./list-item"
import { EmptyState } from "./empty-state"
import { AddPrescriptionDialog } from "./add-prescription-dialog"

interface PrescriptionTabProps {
  medicalRecordId: string
  prescriptions: Prescription[]
  onUpdate: () => void
  isLocked: boolean
}

export function PrescriptionTab({
  medicalRecordId,
  prescriptions,
  onUpdate,
  isLocked,
}: PrescriptionTabProps) {
  const [isDeleting, setDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<string | null>(null)
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked])

  // Calculate subtotal of all prescriptions
  const subtotal = useMemo(() => {
    return prescriptions.reduce((total, prescription) => {
      if (prescription.drugPrice) {
        const quantity = prescription.dispensedQuantity || prescription.quantity
        return total + parseFloat(prescription.drugPrice) * quantity
      }
      return total
    }, 0)
  }, [prescriptions])

  const handleEdit = useCallback((prescription: Prescription) => {
    setPrescriptionToEdit(prescription)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setPrescriptionToEdit(null)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setPrescriptionToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!prescriptionToDelete) return

    try {
      setError(null)
      setDeleting(true)
      await deletePrescription(prescriptionToDelete)
      setDeleteDialogOpen(false)
      setPrescriptionToDelete(null)
      onUpdate()
      toast.success("Resep berhasil dihapus!")
    } catch (err) {
      setError(getErrorMessage(err))
      toast.error(`Gagal menghapus resep`)
    } finally {
      setDeleting(false)
    }
  }, [prescriptionToDelete, onUpdate])

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Button */}
      {canEdit && (
        <div className="flex">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Resep
          </Button>
        </div>
      )}

      {/* Existing Prescriptions */}
      {prescriptions.length > 0 && (
        <SectionCard
          title="Daftar Resep"
          description="Resep obat yang telah diresepkan untuk pasien ini"
        >
          <div className="space-y-3">
            {prescriptions.map((prescription) => {
              const subtotal =
                parseFloat(prescription.drugPrice || "0") *
                (prescription.dispensedQuantity || prescription.quantity)
              return (
                <ListItem
                  key={prescription.id}
                  onEdit={() => handleEdit(prescription)}
                  onDelete={() => handleDeleteClick(prescription.id)}
                  showEdit={canDeletePrescription(isLocked, prescription.isFulfilled)}
                  showDelete={canDeletePrescription(isLocked, prescription.isFulfilled)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{prescription.drugName}</span>
                        {prescription.addedByPharmacist && (
                          <Badge
                            variant="outline"
                            className="border-teal-300 bg-teal-50 text-teal-700"
                          >
                            Ditambahkan Farmasi
                          </Badge>
                        )}
                        {prescription.isFulfilled && (
                          <Badge variant="secondary">Sudah Diambil</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-muted-foreground grid grid-cols-1 gap-x-4 gap-y-1 text-sm md:grid-cols-2">
                      <div className="grid grid-cols-4 md:col-span-1">
                        <span className="col-span-2 font-medium">Frekuensi</span>
                        <span className="col-span-2">: {prescription.frequency}</span>
                      </div>
                      <div className="grid grid-cols-4 md:col-span-1">
                        <span className="col-span-2 font-medium">Jumlah</span>
                        <span className="col-span-2">: {prescription.quantity}</span>
                      </div>
                      {prescription.route && (
                        <div className="grid grid-cols-4 md:col-span-1">
                          <span className="col-span-2 font-medium">Rute</span>
                          <span className="col-span-2">: {prescription.route}</span>
                        </div>
                      )}
                      {prescription.drugPrice && (
                        <div className="grid grid-cols-4 md:col-span-1">
                          <span className="col-span-2 font-medium">Harga</span>
                          <span className="col-span-2">
                            : Rp {parseFloat(prescription.drugPrice).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-4 md:col-span-1">
                        <span className="col-span-2 font-medium">Instruksi Tambahan</span>
                        <span className="col-span-2">: {prescription.instructions || "-"}</span>
                      </div>
                      {prescription.drugPrice && (
                        <div className="grid grid-cols-4 md:col-span-1">
                          <span className="col-span-2 font-medium">Subtotal</span>
                          <span className="text-primary col-span-2 font-semibold">
                            : Rp {subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                    {prescription.addedByPharmacist && prescription.pharmacistNote && (
                      <div className="mt-2 rounded border border-teal-200 bg-teal-50 p-2 text-sm">
                        <div className="mb-1 font-medium text-teal-900">Catatan Farmasi:</div>
                        <p className="text-teal-800 italic">{prescription.pharmacistNote}</p>
                        {prescription.addedByPharmacistName && (
                          <p className="mt-1 text-xs text-teal-600">
                            Ditambahkan oleh: {prescription.addedByPharmacistName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ListItem>
              )
            })}

            {/* Subtotal */}
            {subtotal > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold">Subtotal Resep</span>
                <span className="text-primary text-lg font-bold">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {prescriptions.length === 0 && <EmptyState message="Belum ada resep yang ditambahkan" />}

      {/* Add/Edit Prescription Dialog */}
      <AddPrescriptionDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        medicalRecordId={medicalRecordId}
        onSuccess={onUpdate}
        prescription={prescriptionToEdit}
        existingPrescriptions={prescriptions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Resep?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Resep akan dihapus permanen dari rekam medis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
