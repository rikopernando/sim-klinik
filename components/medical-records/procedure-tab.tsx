"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
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

import { deleteProcedure } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { formatDate } from "@/lib/utils/date"
import { type Procedure } from "@/types/medical-record"
import { canEditMedicalRecord } from "@/lib/utils/medical-record"

import { SectionCard } from "./section-card"
import { ListItem } from "./list-item"
import { EmptyState } from "./empty-state"
import { AddProcedureDialog } from "./add-procedure-dialog"

interface ProcedureTabProps {
  medicalRecordId: number
  procedures: Procedure[]
  onUpdate: () => void
  isLocked: boolean
}

export function ProcedureTab({
  medicalRecordId,
  procedures,
  onUpdate,
  isLocked,
}: ProcedureTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [procedureToDelete, setProcedureToDelete] = useState<number | null>(null)
  const [procedureToEdit, setProcedureToEdit] = useState<Procedure | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked])

  // Calculate subtotal of all procedures
  const subtotal = useMemo(() => {
    return procedures.reduce((total, procedure) => {
      if (procedure.servicePrice) {
        return total + parseFloat(procedure.servicePrice)
      }
      return total
    }, 0)
  }, [procedures])

  const handleEdit = useCallback((procedure: Procedure) => {
    setProcedureToEdit(procedure)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setProcedureToEdit(null)
  }, [])

  const handleDeleteClick = useCallback((id: number) => {
    setProcedureToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!procedureToDelete) return

    try {
      setError(null)
      await deleteProcedure(procedureToDelete)
      setDeleteDialogOpen(false)
      setProcedureToDelete(null)
      onUpdate()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [procedureToDelete, onUpdate])

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
        <div className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tindakan
          </Button>
        </div>
      )}

      {/* Existing Procedures */}
      {procedures.length > 0 && (
        <SectionCard
          title="Daftar Tindakan"
          description="Tindakan medis yang telah dilakukan pada pasien ini"
        >
          <div className="space-y-3">
            {procedures.map((procedure) => (
              <ListItem
                key={procedure.id}
                onEdit={() => handleEdit(procedure)}
                onDelete={() => handleDeleteClick(procedure.id)}
                showEdit={canEdit}
                showDelete={canEdit}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {procedure.serviceName || procedure.description}
                    </p>
                    {procedure.servicePrice && (
                      <span className="text-primary text-sm font-semibold">
                        Rp {parseFloat(procedure.servicePrice).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  {procedure.description !== procedure.serviceName && (
                    <p className="text-muted-foreground text-xs">{procedure.description}</p>
                  )}
                  <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                    {procedure.performedByName && (
                      <div>
                        <span className="font-medium">Dilakukan oleh:</span>{" "}
                        {procedure.performedByName}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Waktu:</span>{" "}
                      {formatDate(procedure.performedAt)}
                    </div>
                  </div>
                  {procedure.notes && (
                    <p className="text-muted-foreground text-sm italic">{procedure.notes}</p>
                  )}
                </div>
              </ListItem>
            ))}

            {/* Subtotal */}
            {subtotal > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold">Subtotal Tindakan</span>
                <span className="text-primary text-lg font-bold">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {procedures.length === 0 && <EmptyState message="Belum ada tindakan yang ditambahkan" />}

      {/* Add/Edit Procedure Dialog */}
      <AddProcedureDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        medicalRecordId={medicalRecordId}
        onSuccess={onUpdate}
        procedure={procedureToEdit}
        existingProcedures={procedures}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tindakan?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Tindakan akan dihapus permanen dari rekam medis.
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
