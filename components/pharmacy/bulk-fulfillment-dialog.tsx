/**
 * Bulk Prescription Fulfillment Dialog
 * Allows processing multiple prescriptions at once
 */

import { useState, useCallback, useMemo } from "react"
import { AlertCircle, Loader2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PrescriptionQueueItem } from "@/types/pharmacy"

import { usePharmacists } from "./hooks/use-pharmacists"
import { useBulkFulfillmentData } from "./hooks/use-bulk-fulfillment-data"
import { BulkFulfillmentHeader } from "./bulk-fulfillment/header"
import { PrescriptionItem } from "./bulk-fulfillment/prescription-item"
import { FulfillmentFormFields } from "./bulk-fulfillment/form-fields"
import { AddPrescriptionDialog } from "./add-prescription-dialog"

interface BulkFulfillmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedGroup: PrescriptionQueueItem | null
  isSubmitting: boolean
  onSubmit: (
    data: {
      prescriptionId: string
      inventoryId: string
      dispensedQuantity: number
      fulfilledBy: string
      notes?: string
    }[]
  ) => Promise<void>
  onPrescriptionAdded?: () => void // Callback when prescription is added
  medicalRecordId?: string | null // Medical record ID for adding prescriptions
}

export function BulkFulfillmentDialog({
  open,
  onOpenChange,
  selectedGroup,
  isSubmitting,
  onSubmit,
  onPrescriptionAdded,
  medicalRecordId,
}: BulkFulfillmentDialogProps) {
  // Form state
  const [fulfilledBy, setFulfilledBy] = useState("")
  const [notes, setNotes] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [addPrescriptionDialogOpen, setAddPrescriptionDialogOpen] = useState(false)

  // Custom hooks
  const { pharmacists, isLoading: isLoadingPharmacists } = usePharmacists(open)
  const {
    fulfillmentData,
    handleAllocationsChange,
    reset: resetFulfillmentData,
  } = useBulkFulfillmentData(open, selectedGroup)

  // Memoized validation check
  const isFormValid = useMemo(() => {
    if (!fulfilledBy.trim()) return false

    // Check each prescription
    for (const item of selectedGroup?.prescriptions || []) {
      // Compound prescriptions are always valid (no batch needed)
      if (item.prescription.isCompound) continue

      // Regular drug prescriptions need valid batch allocation
      const data = fulfillmentData[item.prescription.id]
      if (!data || data.isLoading || data.allocatedBatches.length === 0) return false
      const totalAllocated = data.allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
      if (totalAllocated !== data.dispensedQuantity) return false
    }
    return true
  }, [fulfilledBy, fulfillmentData, selectedGroup])

  // Helper to get medication name (drug or compound recipe)
  const getMedicationName = useCallback((item: PrescriptionQueueItem["prescriptions"][0]) => {
    if (item.prescription.isCompound && item.compoundRecipe) {
      return item.compoundRecipe.name
    }
    return item.drug?.name || "Unknown"
  }, [])

  // Check for stock issues using total stock across all batches
  // Skip compound prescriptions as they don't use inventory
  const stockIssues = useMemo(() => {
    const issues: string[] = []
    for (const item of selectedGroup?.prescriptions || []) {
      // Skip compound prescriptions - they don't need batch allocation
      if (item.prescription.isCompound) continue

      const data = fulfillmentData[item.prescription.id]
      if (data && !data.isLoading) {
        const medicationName = getMedicationName(item)
        // No batches available
        if (data.availableBatches.length === 0) {
          issues.push(`"${medicationName}" tidak memiliki stok tersedia`)
        }
        // Total stock across all batches is insufficient
        else if (data.totalAvailableStock < data.dispensedQuantity) {
          issues.push(
            `"${medicationName}" total stok tidak cukup (tersedia: ${data.totalAvailableStock}, butuh: ${data.dispensedQuantity})`
          )
        }
        // Allocated quantity doesn't match required
        else {
          const totalAllocated = data.allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
          if (totalAllocated < data.dispensedQuantity) {
            issues.push(
              `"${medicationName}" jumlah alokasi kurang (dialokasikan: ${totalAllocated}, butuh: ${data.dispensedQuantity})`
            )
          } else if (totalAllocated > data.dispensedQuantity) {
            issues.push(
              `"${medicationName}" jumlah alokasi berlebih (dialokasikan: ${totalAllocated}, butuh: ${data.dispensedQuantity})`
            )
          }
        }
      }
    }
    return issues
  }, [selectedGroup, fulfillmentData, getMedicationName])

  // Handlers
  const handleSubmit = useCallback(async () => {
    setValidationError(null)

    // Check for stock issues first
    if (stockIssues.length > 0) {
      setValidationError(`Stok tidak mencukupi: ${stockIssues.join(", ")}`)
      return
    }

    // Validate all fields are filled
    if (!fulfilledBy.trim()) {
      setValidationError("Nama petugas wajib diisi")
      return
    }

    const prescriptionData: Array<{
      prescriptionId: string
      inventoryId: string
      dispensedQuantity: number
      fulfilledBy: string
      notes?: string
      isCompound?: boolean
    }> = []

    for (const item of selectedGroup?.prescriptions || []) {
      const medicationName = getMedicationName(item)

      // Handle compound prescriptions differently - no batch allocation needed
      if (item.prescription.isCompound) {
        prescriptionData.push({
          prescriptionId: item.prescription.id,
          inventoryId: "", // No inventory for compound
          dispensedQuantity: item.prescription.quantity,
          fulfilledBy: fulfilledBy.trim(),
          notes: notes.trim() || undefined,
          isCompound: true,
        })
        continue
      }

      // Regular drug prescription - needs batch allocation
      const data = fulfillmentData[item.prescription.id]

      if (!data || data.allocatedBatches.length === 0) {
        setValidationError(`Batch untuk "${medicationName}" belum dipilih`)
        return
      }

      if (!data.dispensedQuantity || data.dispensedQuantity <= 0) {
        setValidationError(`Jumlah untuk "${medicationName}" tidak valid`)
        return
      }

      // Validate total allocated matches required
      const totalAllocated = data.allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
      if (totalAllocated !== data.dispensedQuantity) {
        setValidationError(
          `Jumlah alokasi "${medicationName}" tidak sesuai (dialokasikan: ${totalAllocated}, butuh: ${data.dispensedQuantity})`
        )
        return
      }

      // Push one entry per allocated batch (supports multi-batch fulfillment)
      for (const alloc of data.allocatedBatches) {
        prescriptionData.push({
          prescriptionId: item.prescription.id,
          inventoryId: alloc.batch.id,
          dispensedQuantity: alloc.quantity,
          fulfilledBy: fulfilledBy.trim(),
          notes: notes.trim() || undefined,
        })
      }
    }

    await onSubmit(prescriptionData)
  }, [fulfilledBy, notes, selectedGroup, fulfillmentData, onSubmit, stockIssues, getMedicationName])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetFulfillmentData()
      setFulfilledBy("")
      setNotes("")
      setValidationError(null)
      onOpenChange(false)
    }
  }, [isSubmitting, resetFulfillmentData, onOpenChange])

  const handlePrescriptionAdded = useCallback(() => {
    if (onPrescriptionAdded) {
      onPrescriptionAdded()
    }
  }, [onPrescriptionAdded])

  const handleOpenAddPrescription = useCallback(() => {
    setAddPrescriptionDialogOpen(true)
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <BulkFulfillmentHeader selectedGroup={selectedGroup} />
          </DialogHeader>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Stock Issues Warning */}
          {stockIssues.length > 0 && !validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Masalah Stok:</div>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {stockIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Prescription Items */}
            {selectedGroup?.prescriptions.map((item, idx) => (
              <PrescriptionItem
                key={item.prescription.id}
                index={idx}
                drugId={item.drug?.id || ""}
                drugName={getMedicationName(item)}
                frequency={item.prescription.frequency}
                quantity={item.prescription.quantity}
                instructions={item.prescription.instructions}
                unit={item.drug?.unit || "unit"}
                fulfillmentData={fulfillmentData[item.prescription.id]}
                onAllocationsChange={(allocs) =>
                  handleAllocationsChange(item.prescription.id, allocs)
                }
                showSeparator={idx > 0}
                isCompound={item.prescription.isCompound}
                compoundRecipe={item.compoundRecipe}
              />
            ))}

            <Separator />

            {/* Add Prescription Button */}
            {medicalRecordId && selectedGroup?.doctor && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddPrescription}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Resep
              </Button>
            )}

            {/* Common Fields */}
            <FulfillmentFormFields
              notes={notes}
              fulfilledBy={fulfilledBy}
              pharmacists={pharmacists}
              isLoadingPharmacists={isLoadingPharmacists}
              onFulfilledByChange={setFulfilledBy}
              onNotesChange={setNotes}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid || stockIssues.length > 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Proses ${selectedGroup?.prescriptions.length || 0} Resep`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Prescription Dialog */}
      {medicalRecordId && selectedGroup?.doctor && (
        <AddPrescriptionDialog
          open={addPrescriptionDialogOpen}
          onOpenChange={setAddPrescriptionDialogOpen}
          medicalRecordId={medicalRecordId}
          doctor={selectedGroup.doctor}
          onSuccess={handlePrescriptionAdded}
        />
      )}
    </>
  )
}
