"use client"

/**
 * Final Discharge Dialog Component
 * For completing patient discharge after billing is paid
 * Releases bed and completes the visit
 */

import { useState } from "react"
import { toast } from "sonner"
import {
  IconDoorExit,
  IconAlertTriangle,
  IconBed,
  IconCheck,
  IconClipboardCheck,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getErrorMessage } from "@/lib/utils/error"
import { finalInpatientDischargeSummary } from "@/lib/services/inpatient.service"

interface FinalDischargeDialogProps {
  visitId: string
  patientName: string
  roomNumber?: string
  bedNumber?: string
  onSuccess: () => void
}

export function FinalDischargeDialog({
  visitId,
  patientName,
  roomNumber,
  bedNumber,
  onSuccess,
}: FinalDischargeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinalDischarge = async () => {
    setIsSubmitting(true)
    try {
      await finalInpatientDischargeSummary({ visitId })
      toast.success("Pasien berhasil dipulangkan. Kamar telah dibebaskan.")
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error processing final discharge:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <IconDoorExit className="mr-2 h-5 w-5" />
          Pulangkan Pasien (Final Discharge)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconDoorExit className="h-5 w-5" />
            Konfirmasi Pemulangan Pasien
          </DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Alert */}
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>
              Aksi ini tidak dapat dibatalkan. Setelah pasien dipulangkan:
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>Kamar/bed akan dibebaskan dan tersedia untuk pasien lain</li>
                <li>Visit akan diselesaikan dengan status &quot;completed&quot;</li>
                <li>Data tidak dapat diubah kecuali oleh administrator</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Checklist Info */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-3 text-sm">
              <IconClipboardCheck className="h-5 w-5 text-green-600" />
              <span className="font-medium">Resume medis telah dibuat</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <IconCheck className="h-5 w-5 text-green-600" />
              <span className="font-medium">Billing telah dibuat dan lunas</span>
            </div>

            {roomNumber && bedNumber && (
              <div className="flex items-center gap-3 text-sm">
                <IconBed className="text-muted-foreground h-5 w-5" />
                <span>
                  Kamar: <strong>{roomNumber}</strong> • Bed: <strong>{bedNumber}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Confirmation Text */}
          <p className="text-sm">
            Pastikan pasien telah menerima obat pulang dan memahami instruksi perawatan di rumah
            sebelum melanjutkan.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleFinalDischarge} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Ya, Pulangkan Pasien"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
