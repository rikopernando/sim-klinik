/**
 * Medical Record Actions Component
 * Displays action buttons (Save Draft, Lock & Finish) with loading states
 * Allows doctor to add billing adjustment when locking
 */

import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { Loader2, Save, Lock, BedDouble, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
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
import { TransferToInpatientDialog } from "@/components/visits/transfer-to-inpatient-dialog"

import { BillingAdjustmentForm } from "./billing-adjustment-form"

interface MedicalRecordActionsProps {
  isSaving: boolean
  isLocking: boolean
  lastSavedAt?: Date | string
  canTransfer?: boolean
  patientName?: string
  onSave: () => Promise<void>
  onLock: (billingAdjustment?: number, adjustmentNote?: string) => Promise<void>
}

export function MedicalRecordActions({
  isSaving,
  isLocking,
  lastSavedAt,
  canTransfer,
  patientName,
  onSave,
  onLock,
}: MedicalRecordActionsProps) {
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
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

  const lastSavedText = lastSavedAt
    ? formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true, locale: idLocale })
    : null

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Last saved indicator */}
        {!isSaving && lastSavedText && (
          <span className="text-muted-foreground hidden flex-1 items-center gap-1.5 text-sm sm:flex">
            <Check className="h-4 w-4 text-green-500" />
            Update terakhir {lastSavedText}
          </span>
        )}
        {isSaving && (
          <span className="text-muted-foreground hidden flex-1 items-center gap-1.5 text-xs sm:flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Menyimpan...
          </span>
        )}

        {canTransfer && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransferDialogOpen(true)}
              disabled={isSaving || isLocking}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <BedDouble className="mr-2 h-4 w-4" />
              Pindahkan Ke Rawat Inap
            </Button>
            <span className="bg-border h-4 w-px shrink-0" />
          </>
        )}
        <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving || isLocking}>
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
        <Button size="sm" onClick={handleOpenDialogLock} disabled={isSaving || isLocking}>
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

      {/* Transfer to Inpatient Dialog */}
      {canTransfer && (
        <TransferToInpatientDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          visitId={visitId}
          patientName={patientName ?? ""}
          onSuccess={() => router.push("/dashboard/inpatient/patients")}
        />
      )}

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
            <DischargeBillingPreviewSection
              type="Rawat Jalan"
              summary={summary}
              isLoading={isFetching}
              adjustmentType={adjustmentType}
              adjustmentAmount={adjustmentAmount}
            />
            <Separator />
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
