/**
 * Complete Discharge Dialog
 * Confirms completion of inpatient treatment and shows billing preview
 * Creates billing AND marks visit as ready_for_billing for cashier queue
 * Allows clinical staff to add billing adjustments (discounts/surcharges)
 */

"use client"

import { useState, useCallback } from "react"
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
import { Separator } from "@/components/ui/separator"
import { useDischargeBilling } from "@/hooks/use-discharge-billing"
import { BillingAdjustmentForm } from "@/components/medical-records/billing-adjustment-form"

import { DischargeBillingPreviewSection } from "./discharge-billing-preview-section"

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

  // Billing adjustment state
  const [adjustmentType, setAdjustmentType] = useState<"none" | "discount" | "surcharge">("none")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")

  // Reset adjustment form
  const resetAdjustmentForm = useCallback(() => {
    setAdjustmentType("none")
    setAdjustmentAmount("")
    setAdjustmentNote("")
  }, [])

  // Calculate billing adjustment value
  const calculateBillingAdjustment = useCallback((): number | undefined => {
    if (adjustmentType === "none" || !adjustmentAmount) return undefined

    const amount = parseFloat(adjustmentAmount)
    if (isNaN(amount) || amount <= 0) return undefined

    return adjustmentType === "discount" ? -amount : amount
  }, [adjustmentType, adjustmentAmount])

  // Fetch summary when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      await fetchSummary(visitId)
    } else {
      resetAdjustmentForm()
    }
  }

  // Handle discharge completion
  // Creates billing AND updates visit status to ready_for_billing
  const handleCompleteDischarge = async () => {
    const billingAdjustment = calculateBillingAdjustment()
    await createBilling(visitId, billingAdjustment, adjustmentNote || undefined)
    setOpen(false)
    resetAdjustmentForm()
    onSuccess?.()
  }

  const handleAdjustmentTypeChange = useCallback((type: "none" | "discount" | "surcharge") => {
    setAdjustmentType(type)
  }, [])

  const handleAdjustmentAmountChange = useCallback((amount: string) => {
    setAdjustmentAmount(amount)
  }, [])

  const handleAdjustmentNoteChange = useCallback((note: string) => {
    setAdjustmentNote(note)
  }, [])

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

        <div className="space-y-4">
          {/* Information Alert */}
          <Alert>
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dengan menyelesaikan rawat inap, tagihan akan dibuat dan pasien akan masuk ke antrian
              kasir untuk proses pembayaran. Pastikan semua catatan medis, material, resep obat, dan
              tindakan sudah tercatat dengan benar.
            </AlertDescription>
          </Alert>

          {/* Billing Preview with Adjustment */}
          <div>
            <h3 className="mb-3 font-semibold">Ringkasan Tagihan</h3>
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
            <DischargeBillingPreviewSection
              summary={summary}
              isLoading={isFetching}
              adjustmentType={adjustmentType}
              adjustmentAmount={adjustmentAmount}
            />
          </div>

          <Separator />

          {/* Billing Adjustment Form */}
          <BillingAdjustmentForm
            adjustmentType={adjustmentType}
            adjustmentAmount={adjustmentAmount}
            adjustmentNote={adjustmentNote}
            onAdjustmentTypeChange={handleAdjustmentTypeChange}
            onAdjustmentAmountChange={handleAdjustmentAmountChange}
            onAdjustmentNoteChange={handleAdjustmentNoteChange}
          />
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
