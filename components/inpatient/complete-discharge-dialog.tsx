/**
 * Complete Discharge Dialog
 * Confirms completion of inpatient treatment and shows billing preview
 * Creates billing AND marks visit as ready_for_billing for cashier queue
 */

"use client"

import { useState } from "react"
import { IconCheck, IconAlertCircle } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDischargeBilling } from "@/hooks/use-discharge-billing"

import { DischargeBillingSummaryCard } from "./discharge-billing-summary-card"

interface CompleteDischargeDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function CompleteDischargeDialog({
  visitId,
  patientName,
  onSuccess,
}: CompleteDischargeDialogProps) {
  const [open, setOpen] = useState(false)
  const { summary, fetchSummary, createBilling, isFetching, isCreating } = useDischargeBilling()

  // Fetch summary when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      await fetchSummary(visitId)
    }
  }

  // Handle discharge completion
  // Creates billing AND updates visit status to ready_for_billing
  const handleCompleteDischarge = async () => {
    await createBilling(visitId)
    setOpen(false)
    onSuccess?.()
  }

  const hasItems = summary && summary.totalItems > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg">
          <IconCheck className="mr-2 h-5 w-5" />
          Selesai Rawat Inap
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Selesaikan Rawat Inap</DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Information Alert */}
          <Alert>
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dengan menyelesaikan rawat inap, <strong>tagihan akan dibuat</strong> dan pasien akan
              masuk ke <strong>antrian kasir</strong> untuk proses pembayaran. Pastikan semua
              catatan medis, material, resep obat, dan tindakan sudah tercatat dengan benar.
            </AlertDescription>
          </Alert>

          {/* Billing Preview */}
          <div>
            <h3 className="mb-3 font-semibold">Preview Tagihan</h3>
            {!isFetching && !hasItems && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tidak ada item yang dapat ditagihkan. Pastikan pasien memiliki catatan rawat inap,
                  material usage, resep obat yang telah dipenuhi, atau tindakan medis yang telah
                  selesai.
                </AlertDescription>
              </Alert>
            )}
            <DischargeBillingSummaryCard summary={summary} isLoading={isFetching} />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleCompleteDischarge}
            disabled={isCreating || isFetching || !hasItems}
          >
            {isCreating ? "Memproses..." : "Selesaikan Rawat Inap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
