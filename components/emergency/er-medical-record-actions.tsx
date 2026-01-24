/**
 * ER Medical Record Actions Component
 * Extended version of MedicalRecordActions with required disposition field
 * For emergency room medical records
 */

"use client"

import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useState, useCallback } from "react"
import { Loader2, Save, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { BillingAdjustmentForm } from "@/components/medical-records/billing-adjustment-form"
import { getDispositionOptions, getDispositionLabel } from "@/lib/emergency/disposition-utils"
import type { DispositionType } from "@/types/emergency"

interface ERMedicalRecordActionsProps {
  isLocked: boolean
  isSaving: boolean
  isLocking: boolean
  currentDisposition: DispositionType | null
  onSave: () => Promise<void>
  onLock: (
    disposition: DispositionType,
    billingAdjustment?: number,
    adjustmentNote?: string
  ) => Promise<void>
  onUnlock?: () => Promise<void>
}

export function ERMedicalRecordActions({
  isLocked,
  isSaving,
  isLocking,
  currentDisposition,
  onSave,
  onLock,
  onUnlock,
}: ERMedicalRecordActionsProps) {
  const { visitId } = useParams<{ visitId: string }>()
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)

  // Disposition state
  const [selectedDisposition, setSelectedDisposition] = useState<DispositionType | null>(
    currentDisposition
  )

  // Billing adjustment state
  const [adjustmentType, setAdjustmentType] = useState<"none" | "discount" | "surcharge">("none")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")

  // Billing summary state
  const [summary, setSummary] = useState<DischargeBillingSummary | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const dispositionOptions = getDispositionOptions()

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedDisposition(currentDisposition)
    setAdjustmentType("none")
    setAdjustmentAmount("")
    setAdjustmentNote("")
  }, [currentDisposition])

  // Calculate billing adjustment value
  const calculateBillingAdjustment = useCallback((): number | undefined => {
    if (adjustmentType === "none" || !adjustmentAmount) return undefined

    const amount = parseFloat(adjustmentAmount)
    if (isNaN(amount) || amount <= 0) return undefined

    return adjustmentType === "discount" ? -amount : amount
  }, [adjustmentType, adjustmentAmount])

  // Handle lock confirmation
  const handleLockConfirm = useCallback(async () => {
    if (!selectedDisposition) {
      toast.error("Pilih disposisi pasien terlebih dahulu")
      return
    }

    setLockDialogOpen(false)

    const billingAdjustment = calculateBillingAdjustment()
    await onLock(selectedDisposition, billingAdjustment, adjustmentNote || undefined)

    resetForm()
  }, [selectedDisposition, calculateBillingAdjustment, adjustmentNote, onLock, resetForm])

  // Handle unlock confirmation
  const handleUnlockConfirm = useCallback(async () => {
    setUnlockDialogOpen(false)
    if (onUnlock) {
      await onUnlock()
    }
  }, [onUnlock])

  // Open lock dialog and fetch billing summary
  const handleOpenDialogLock = useCallback(async () => {
    setSelectedDisposition(currentDisposition)
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
  }, [visitId, currentDisposition])

  // Locked state - show unlock button
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

  // Not locked - show save and lock buttons
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

      {/* Lock Confirmation Dialog with Disposition */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Kunci Rekam Medis UGD?</AlertDialogTitle>
            <AlertDialogDescription>
              Tentukan disposisi pasien dan periksa ringkasan billing sebelum mengunci rekam medis.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-4">
            {/* Disposition Selection - Required */}
            <div className="space-y-2">
              <Label htmlFor="disposition" className="flex items-center gap-1">
                Disposisi Pasien <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedDisposition || ""}
                onValueChange={(value) => setSelectedDisposition(value as DispositionType)}
              >
                <SelectTrigger id="disposition">
                  <SelectValue placeholder="Pilih disposisi pasien" />
                </SelectTrigger>
                <SelectContent>
                  {dispositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Show selected disposition info */}
              {selectedDisposition && (
                <p className="text-muted-foreground text-xs">
                  {dispositionOptions.find((o) => o.value === selectedDisposition)?.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Billing Preview */}
            <DischargeBillingPreviewSection
              type="UGD"
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
              onAdjustmentTypeChange={setAdjustmentType}
              onAdjustmentAmountChange={setAdjustmentAmount}
              onAdjustmentNoteChange={setAdjustmentNote}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLockConfirm}
              disabled={!selectedDisposition}
              className="bg-primary hover:bg-primary/90"
            >
              {selectedDisposition
                ? `Kunci & ${getDispositionLabel(selectedDisposition)}`
                : "Pilih Disposisi Dulu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
