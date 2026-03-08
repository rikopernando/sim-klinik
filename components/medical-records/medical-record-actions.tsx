/**
 * Medical Record Actions Component
 * Displays action buttons (Save Draft, Lock & Finish) with loading states
 * Allows doctor to add billing adjustment when locking
 */

import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useState, useCallback } from "react"
import { Loader2, Save, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
import { DischargeBillingSummary } from "@/types/billing"
import { getDischargeBillingSummary } from "@/lib/services/billing.service"
import { getErrorMessage } from "@/lib/utils/error"
import { DischargeBillingPreviewSection } from "@/components/inpatient/discharge-billing-preview-section"

import { BillingAdjustmentForm } from "./billing-adjustment-form"

interface MedicalRecordActionsProps {
  isLocked: boolean
  isSaving: boolean
  isLocking: boolean
  onSave: () => Promise<void>
  onLock: (billingAdjustment?: number, adjustmentNote?: string) => Promise<void>
  onUnlock?: () => Promise<void>
}

export function MedicalRecordActions({
  isLocked,
  isSaving,
  isLocking,
  onSave,
  onLock,
  onUnlock,
}: MedicalRecordActionsProps) {
  const { visitId } = useParams<{ visitId: string }>()
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"none" | "discount" | "surcharge">("none")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")
  const [summary, setSummary] = useState<DischargeBillingSummary | null>(null)
  const [isFetching, setIsFetching] = useState(false)

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

  const handleLockConfirm = useCallback(async () => {
    setLockDialogOpen(false)

    const billingAdjustment = calculateBillingAdjustment()
    await onLock(billingAdjustment, adjustmentNote || undefined)

    resetAdjustmentForm()
  }, [calculateBillingAdjustment, adjustmentNote, onLock, resetAdjustmentForm])

  const handleUnlockConfirm = useCallback(async () => {
    setUnlockDialogOpen(false)
    if (onUnlock) {
      await onUnlock()
    }
  }, [onUnlock])

  const handleAdjustmentTypeChange = useCallback((type: "none" | "discount" | "surcharge") => {
    setAdjustmentType(type)
  }, [])

  const handleAdjustmentAmountChange = useCallback((amount: string) => {
    setAdjustmentAmount(amount)
  }, [])

  const handleAdjustmentNoteChange = useCallback((note: string) => {
    setAdjustmentNote(note)
  }, [])

  /**
   * Fetch discharge billing summary
   */
  const handleOpenDialogLock = useCallback(async () => {
    setIsFetching(true)
    setLockDialogOpen(true)

    try {
      const response = await getDischargeBillingSummary(visitId)
      setSummary(response)
    } catch (err) {
      toast.error(getErrorMessage(err))
      console.error("Discharge billing summary fetch error:", err)
    } finally {
      setIsFetching(false)
    }
  }, [visitId])

  if (isLocked) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setUnlockDialogOpen(true)}
          disabled={isSaving || isLocking}
        >
          {isLocking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Membuka kunci...
            </>
          ) : (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Buka Kunci Rekam Medis
            </>
          )}
        </Button>

        {/* Unlock Confirmation Dialog */}
        <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Buka Kunci Rekam Medis?</AlertDialogTitle>
              <AlertDialogDescription>
                Rekam medis akan dapat diedit kembali. Pastikan pasien belum pulang.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlockConfirm}
                className="bg-primary hover:bg-primary/90"
              >
                Ya, Buka Kunci
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onSave} disabled={isSaving || isLocking}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </>
          )}
        </Button>
        <Button onClick={handleOpenDialogLock} disabled={isSaving || isLocking}>
          {isLocking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengunci...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Kunci & Selesai
            </>
          )}
        </Button>
      </div>

      {/* Lock Confirmation Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Kunci Rekam Medis?</AlertDialogTitle>
            <AlertDialogDescription>
              Pastikan semua informasi sudah lengkap dan benar. Anda dapat menambahkan penyesuaian
              billing jika diperlukan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-4">
            {/* Billing Preview */}
            <DischargeBillingPreviewSection
              type="Rawat Jalan"
              summary={summary}
              isLoading={isFetching}
              adjustmentType={adjustmentType}
              adjustmentAmount={adjustmentAmount}
            />

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

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLockConfirm}
              className="bg-primary hover:bg-primary/90"
            >
              Ya, Kunci Rekam Medis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
