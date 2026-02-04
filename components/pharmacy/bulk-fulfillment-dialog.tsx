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
    handleBatchSelect,
    reset: resetFulfillmentData,
  } = useBulkFulfillmentData(open, selectedGroup)

  // Memoized validation check
  const isFormValid = useMemo(() => {
    if (!fulfilledBy.trim()) return false
    return !Object.values(fulfillmentData).some((d) => d.isLoading || !d.inventoryId)
  }, [fulfilledBy, fulfillmentData])

  // Check for stock issues (items with no batches available)
  const stockIssues = useMemo(() => {
    const issues: string[] = []
    for (const item of selectedGroup?.prescriptions || []) {
      const data = fulfillmentData[item.prescription.id]
      if (data && !data.isLoading) {
        // No batches available
        if (data.availableBatches.length === 0) {
          issues.push(`"${item.drug.name}" tidak memiliki stok tersedia`)
        }
        // Selected batch has insufficient stock
        else if (data.selectedBatch && data.selectedBatch.stockQuantity < data.dispensedQuantity) {
          issues.push(
            `"${item.drug.name}" stok tidak cukup (tersedia: ${data.selectedBatch.stockQuantity}, butuh: ${data.dispensedQuantity})`
          )
        }
      }
    }
    return issues
  }, [selectedGroup, fulfillmentData])

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
    }> = []

    for (const item of selectedGroup?.prescriptions || []) {
      const data = fulfillmentData[item.prescription.id]

      if (!data || !data.inventoryId) {
        setValidationError(`Batch untuk "${item.drug.name}" belum dipilih`)
        return
      }

      if (!data.dispensedQuantity || data.dispensedQuantity <= 0) {
        setValidationError(`Jumlah untuk "${item.drug.name}" tidak valid`)
        return
      }

      // Double-check stock availability
      if (data.selectedBatch && data.selectedBatch.stockQuantity < data.dispensedQuantity) {
        setValidationError(
          `Stok "${item.drug.name}" tidak mencukupi (tersedia: ${data.selectedBatch.stockQuantity}, butuh: ${data.dispensedQuantity})`
        )
        return
      }

      prescriptionData.push({
        prescriptionId: item.prescription.id,
        inventoryId: data.inventoryId,
        dispensedQuantity: data.dispensedQuantity,
        fulfilledBy: fulfilledBy.trim(),
        notes: notes.trim() || undefined,
      })
    }

    await onSubmit(prescriptionData)
  }, [fulfilledBy, notes, selectedGroup, fulfillmentData, onSubmit, stockIssues])

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
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
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
                drugId={item.drug.id}
                drugName={item.drug.name}
                genericName={item.drug.genericName}
                frequency={item.prescription.frequency}
                quantity={item.prescription.quantity}
                unit={item.drug.unit}
                fulfillmentData={fulfillmentData[item.prescription.id]}
                onBatchSelect={(batch) => handleBatchSelect(item.prescription.id, batch)}
                showSeparator={idx > 0}
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
