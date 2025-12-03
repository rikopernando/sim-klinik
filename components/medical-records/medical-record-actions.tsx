/**
 * Medical Record Actions Component
 * Displays action buttons (Save Draft, Lock & Finish) with loading states
 * Allows doctor to add billing adjustment when locking
 */

import { useState, useEffect } from "react"
import { Loader2, Save, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

interface BillingPreview {
  drugsSubtotal: number
  proceduresSubtotal: number
  consultationFee: number
  subtotal: number
}

interface MedicalRecordActionsProps {
  isLocked: boolean
  isSaving: boolean
  isLocking: boolean
  visitId: number
  onSave: () => Promise<void>
  onLock: (billingAdjustment?: number, adjustmentNote?: string) => Promise<void>
  onUnlock?: () => Promise<void>
}

export function MedicalRecordActions({
  isLocked,
  isSaving,
  isLocking,
  visitId,
  onSave,
  onLock,
  onUnlock,
}: MedicalRecordActionsProps) {
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"none" | "discount" | "surcharge">("none")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")
  const [billingPreview, setBillingPreview] = useState<BillingPreview | null>(null)
  const [isLoadingBilling, setIsLoadingBilling] = useState(false)

  // Fetch billing preview when dialog opens
  useEffect(() => {
    if (lockDialogOpen) {
      setIsLoadingBilling(true)
      fetch(`/api/billing/preview?visitId=${visitId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setBillingPreview(data.data)
          }
        })
        .catch((err) => console.error("Failed to fetch billing preview:", err))
        .finally(() => setIsLoadingBilling(false))
    }
  }, [lockDialogOpen, visitId])

  const handleLockConfirm = async () => {
    setLockDialogOpen(false)

    let billingAdjustment: number | undefined
    if (adjustmentType !== "none" && adjustmentAmount) {
      const amount = parseFloat(adjustmentAmount)
      if (!isNaN(amount) && amount > 0) {
        billingAdjustment = adjustmentType === "discount" ? -amount : amount
      }
    }

    await onLock(billingAdjustment, adjustmentNote || undefined)

    // Reset form
    setAdjustmentType("none")
    setAdjustmentAmount("")
    setAdjustmentNote("")
  }

  const handleUnlockConfirm = async () => {
    setUnlockDialogOpen(false)
    if (onUnlock) {
      await onUnlock()
    }
  }

  // Calculate final total with adjustment
  const calculateFinalTotal = () => {
    if (!billingPreview) return 0
    const adjustment =
      adjustmentType !== "none" && adjustmentAmount
        ? (adjustmentType === "discount" ? -1 : 1) * parseFloat(adjustmentAmount)
        : 0
    return billingPreview.subtotal + adjustment
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLocked) {
    return (
      <>
        <Button variant="outline" onClick={() => setUnlockDialogOpen(true)} disabled={isLocking}>
          <Unlock className="mr-2 h-4 w-4" />
          Buka Kunci Rekam Medis
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
        <Button onClick={() => setLockDialogOpen(true)} disabled={isSaving || isLocking}>
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
            {isLoadingBilling ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">Memuat data billing...</span>
              </div>
            ) : (
              billingPreview && (
                <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                  <h4 className="mb-3 text-sm font-semibold">Ringkasan Billing</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Konsultasi</span>
                      <span>{formatCurrency(billingPreview.consultationFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal Obat</span>
                      <span>{formatCurrency(billingPreview.drugsSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal Tindakan</span>
                      <span>{formatCurrency(billingPreview.proceduresSubtotal)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal Awal</span>
                      <span>{formatCurrency(billingPreview.subtotal)}</span>
                    </div>
                    {adjustmentType !== "none" &&
                      adjustmentAmount &&
                      parseFloat(adjustmentAmount) > 0 && (
                        <>
                          <div
                            className="flex justify-between text-sm"
                            style={{
                              color:
                                adjustmentType === "discount"
                                  ? "rgb(220, 38, 38)"
                                  : "rgb(22, 163, 74)",
                            }}
                          >
                            <span>
                              {adjustmentType === "discount" ? "Diskon Dokter" : "Biaya Tambahan"}
                            </span>
                            <span>
                              {adjustmentType === "discount" ? "- " : "+ "}
                              {formatCurrency(parseFloat(adjustmentAmount))}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="text-primary flex justify-between text-base font-bold">
                            <span>Total Akhir</span>
                            <span>{formatCurrency(calculateFinalTotal())}</span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              )
            )}

            <Separator />
            {/* Adjustment Type */}
            <div className="space-y-2">
              <Label>Penyesuaian Billing (Opsional)</Label>
              <RadioGroup
                value={adjustmentType}
                onValueChange={(value) =>
                  setAdjustmentType(value as "none" | "discount" | "surcharge")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="adj-none" />
                  <Label htmlFor="adj-none" className="font-normal">
                    Tanpa Penyesuaian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discount" id="adj-discount" />
                  <Label htmlFor="adj-discount" className="font-normal">
                    Berikan Diskon
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="surcharge" id="adj-surcharge" />
                  <Label htmlFor="adj-surcharge" className="font-normal">
                    Tambahkan Biaya
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Amount Input */}
            {adjustmentType !== "none" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="adjustment-amount">
                    {adjustmentType === "discount"
                      ? "Nominal Diskon (Rp)"
                      : "Nominal Tambahan (Rp)"}
                  </Label>
                  <Input
                    id="adjustment-amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="Masukkan nominal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustment-note">Keterangan (Opsional)</Label>
                  <Textarea
                    id="adjustment-note"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    placeholder="Alasan penyesuaian billing..."
                    rows={2}
                  />
                </div>
              </>
            )}
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
