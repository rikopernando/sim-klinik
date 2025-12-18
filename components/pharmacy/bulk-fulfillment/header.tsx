/**
 * Bulk Fulfillment Header Component
 * Displays patient info and
 */

import { DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { PrescriptionQueueItem } from "@/types/pharmacy"

interface BulkFulfillmentHeaderProps {
  selectedGroup: PrescriptionQueueItem | null
}

export function BulkFulfillmentHeader({ selectedGroup }: BulkFulfillmentHeaderProps) {
  return (
    <>
      <DialogTitle>Proses Resep</DialogTitle>
      <DialogDescription>
        {selectedGroup && (
          <div>
            <p className="text-foreground font-medium">
              Pasien: {selectedGroup.patient.name} ({selectedGroup.patient.mrNumber})
            </p>
            <p className="text-sm">Kunjungan: {selectedGroup.visit.visitNumber}</p>
            <p className="text-sm">Total Resep: {selectedGroup.prescriptions.length}</p>
          </div>
        )}
      </DialogDescription>
    </>
  )
}
