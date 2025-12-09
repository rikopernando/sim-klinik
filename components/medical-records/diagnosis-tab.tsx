"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"

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

import { deleteDiagnosis } from "@/lib/services/medical-record.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type Diagnosis } from "@/types/medical-record"
import {
  formatDiagnosisType,
  getDiagnosisTypeBadgeVariant,
  canEditMedicalRecord,
} from "@/lib/utils/medical-record"

import { SectionCard } from "./section-card"
import { ListItem } from "./list-item"
import { EmptyState } from "./empty-state"
import { AddDiagnosisDialog } from "./add-diagnosis-dialog"

interface DiagnosisTabProps {
  medicalRecordId: string
  diagnoses: Diagnosis[]
  onUpdate: () => void
  isLocked: boolean
}

export function DiagnosisTab({
  medicalRecordId,
  diagnoses,
  onUpdate,
  isLocked,
}: DiagnosisTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [diagnosisToDelete, setDiagnosisToDelete] = useState<string | null>(null)
  const [diagnosisToEdit, setDiagnosisToEdit] = useState<Diagnosis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked])

  const handleEdit = useCallback((diagnosis: Diagnosis) => {
    setDiagnosisToEdit(diagnosis)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setDiagnosisToEdit(null)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setDiagnosisToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!diagnosisToDelete) return

    try {
      setError(null)
      await deleteDiagnosis(diagnosisToDelete)
      setDeleteDialogOpen(false)
      setDiagnosisToDelete(null)
      onUpdate()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [diagnosisToDelete, onUpdate])

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
            Tambah Diagnosis
          </Button>
        </div>
      )}

      {/* Existing Diagnoses */}
      {diagnoses.length > 0 && (
        <SectionCard
          title="Daftar Diagnosis"
          description="Diagnosis yang telah dicatat untuk pasien ini"
        >
          <div className="space-y-3">
            {diagnoses.map((diagnosis) => (
              <ListItem
                key={diagnosis.id}
                onEdit={() => handleEdit(diagnosis)}
                onDelete={() => handleDeleteClick(diagnosis.id)}
                showEdit={canEdit}
                showDelete={canEdit}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getDiagnosisTypeBadgeVariant(
                        diagnosis.diagnosisType as "primary" | "secondary"
                      )}
                    >
                      {formatDiagnosisType(diagnosis.diagnosisType as "primary" | "secondary")}
                    </Badge>
                    <span className="font-mono text-sm font-medium">{diagnosis.icd10Code}</span>
                  </div>
                  <p className="text-sm">{diagnosis.description}</p>
                </div>
              </ListItem>
            ))}
          </div>
        </SectionCard>
      )}

      {diagnoses.length === 0 && <EmptyState message="Belum ada diagnosis yang ditambahkan" />}

      {/* Add/Edit Diagnosis Dialog */}
      <AddDiagnosisDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        medicalRecordId={medicalRecordId}
        onSuccess={onUpdate}
        diagnosis={diagnosisToEdit}
        existingDiagnoses={diagnoses}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Diagnosis?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Diagnosis akan dihapus permanen dari rekam medis.
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
