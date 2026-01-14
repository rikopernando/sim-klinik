/**
 * Verify Result Dialog Component
 * Allows lab supervisors to verify lab results
 * Refactored to use ResultDisplay for all result types
 */

"use client"

import { useState } from "react"
import { IconShieldCheck, IconAlertCircle } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useVerifyLabResult } from "@/hooks/use-verify-lab-result"
import type { LabOrderWithRelations } from "@/types/lab"
import { ResultDisplay } from "./result-display"
import AttachmentSection from "./lab-attachment"

interface VerifyResultDialogProps {
  order: LabOrderWithRelations
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function VerifyResultDialog({ order, onSuccess, trigger }: VerifyResultDialogProps) {
  const [open, setOpen] = useState(false)

  const { isVerifying, verifyResult } = useVerifyLabResult({
    onSuccess: () => {
      setOpen(false)
      onSuccess?.()
    },
  })

  const handleVerify = async () => {
    // Use result ID instead of order ID
    if (order.result?.id) {
      await verifyResult(order.result.id)
    }
  }

  // Check if result exists
  if (!order.result) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="default" className="gap-2">
            <IconShieldCheck className="h-4 w-4" />
            Verifikasi Hasil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5" />
            Verifikasi Hasil Lab
          </DialogTitle>
          <DialogDescription>
            Verifikasi hasil pemeriksaan laboratorium sebelum dikirim ke dokter
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">Tes Pemeriksaan</p>
                  <p className="font-semibold">{order.test?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Departemen</p>
                  <p className="font-medium">{order.test?.department}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">Pasien</p>
                  <p className="font-medium">{order.patient.name}</p>
                  <p className="font-mono text-xs">{order.patient.mrNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Order Number</p>
                  <p className="font-mono text-sm">{order.orderNumber}</p>
                </div>
              </div>

              {order.result.criticalValue && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hasil ini ditandai sebagai <strong>NILAI KRITIS</strong>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </div>

          {/* Result Display */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Hasil Pemeriksaan</h4>
            <ResultDisplay resultData={order.result.resultData} />
          </div>

          {/* Technician Notes */}
          {order.result.resultNotes && (
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground mb-1 text-xs">Catatan Teknisi</p>
              <p className="text-sm">{order.result.resultNotes}</p>
            </div>
          )}

          {/* Attachment Display */}
          {order.result.attachmentUrl && (
            <AttachmentSection
              attachmentUrl={order.result.attachmentUrl}
              attachmentType={order.result.attachmentType}
              orderNumber={order.orderNumber}
            />
          )}

          {/* Confirmation Message */}
          <Alert>
            <AlertDescription>
              Dengan memverifikasi hasil ini, Anda menyatakan bahwa hasil pemeriksaan sudah benar
              dan dapat dikirimkan ke dokter yang memesan.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isVerifying}>
              Batal
            </Button>
            <Button onClick={handleVerify} disabled={isVerifying} className="gap-2">
              <IconShieldCheck className="h-4 w-4" />
              {isVerifying ? "Memverifikasi..." : "Verifikasi Hasil"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
