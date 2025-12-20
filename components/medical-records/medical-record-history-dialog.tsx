"use client"

/**
 * Medical Record History Dialog Component (D.6) - Refactored
 * Displays patient's previous medical records in a popup
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, FileText, AlertCircle, Loader2 } from "lucide-react"
import { useMedicalRecordHistory } from "@/hooks/use-medical-record-history"
import { PatientAllergyAlert } from "./history/patient-allergy-alert"
import { HistoryRecordCard } from "./history/history-record-card"

interface MedicalRecordHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    <span className="text-muted-foreground ml-2">Memuat riwayat...</span>
  </div>
)

const ErrorState = ({ error }: { error: string }) => (
  <div className="bg-destructive/10 border-destructive flex items-center gap-2 rounded-md border p-4">
    <AlertCircle className="text-destructive h-5 w-5" />
    <p className="text-destructive text-sm">{error}</p>
  </div>
)

const EmptyHistoryState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileText className="text-muted-foreground mb-3 h-12 w-12" />
    <p className="text-muted-foreground text-sm">Belum ada riwayat rekam medis untuk pasien ini</p>
  </div>
)

export function MedicalRecordHistoryDialog({
  open,
  onOpenChange,
  patientId,
}: MedicalRecordHistoryDialogProps) {
  const { history, isLoading, error } = useMedicalRecordHistory({
    patientId,
    enabled: open,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col md:max-w-4xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Rekam Medis
          </DialogTitle>
          <DialogDescription>
            {history?.patient?.name || "Pasien"}
            {history?.patient?.mrNumber && ` - MR: ${history.patient.mrNumber}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <LoadingState />}

        {error && <ErrorState error={error} />}

        {!isLoading && !error && history && (
          <div className="flex-1 overflow-scroll">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4 pb-4">
                {/* Patient Allergies */}
                {history.patient?.allergies && (
                  <PatientAllergyAlert allergies={history.patient.allergies} />
                )}

                {/* Medical Records */}
                {history.history.length === 0 ? (
                  <EmptyHistoryState />
                ) : (
                  history.history.map((record, index) => (
                    <HistoryRecordCard
                      key={record.medicalRecord.id}
                      record={record}
                      visitNumber={history.history.length - index}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex flex-shrink-0 justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
