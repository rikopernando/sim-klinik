/**
 * Prescription Fulfillment Dialog Component (Refactored)
 * Enhanced with batch selection and modular components
 */

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  getAvailableBatches,
  type DrugInventoryWithDetails,
} from "@/lib/services/inventory.service"
import { DrugInfoDisplay } from "./fulfillment/drug-info-display"
import { BatchSelector } from "./fulfillment/batch-selector"
import { FulfillmentForm } from "./fulfillment/fulfillment-form"

interface Drug {
  id: string
  name: string
  genericName?: string | null
  unit: string
}

interface Prescription {
  id: string
  quantity: number
}

interface SelectedPrescription {
  prescription: Prescription
  drug: Drug
}

interface FulfillmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPrescription: SelectedPrescription | null
  isSubmitting: boolean
  onSubmit: (data: {
    inventoryId: string
    dispensedQuantity: number
    fulfilledBy: string
    notes?: string
  }) => void
  currentIndex?: number
  totalPrescriptions?: number
  patientName?: string
}

export function FulfillmentDialog({
  open,
  onOpenChange,
  selectedPrescription,
  isSubmitting,
  onSubmit,
  currentIndex = 0,
  totalPrescriptions = 1,
  patientName,
}: FulfillmentDialogProps) {
  const [formData, setFormData] = useState({
    inventoryId: "",
    dispensedQuantity: "",
    fulfilledBy: "",
    notes: "",
  })

  const [availableBatches, setAvailableBatches] = useState<DrugInventoryWithDetails[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<DrugInventoryWithDetails | null>(null)

  // Fetch available batches when prescription is selected or changed
  useEffect(() => {
    if (open && selectedPrescription?.drug.id) {
      setIsLoadingBatches(true)

      // Reset form when switching to a new prescription
      setFormData({
        inventoryId: "",
        dispensedQuantity: "",
        fulfilledBy: "",
        notes: "",
      })
      setSelectedBatch(null)

      getAvailableBatches(selectedPrescription.drug.id)
        .then((batches) => {
          setAvailableBatches(batches)
          // Auto-select first batch (FEFO - First Expired, First Out)
          if (batches.length > 0) {
            handleBatchSelect(batches[0])
          }
        })
        .catch((error) => {
          console.error("Failed to fetch batches:", error)
          setAvailableBatches([])
        })
        .finally(() => {
          setIsLoadingBatches(false)
        })
    }
  }, [open, selectedPrescription?.drug.id, selectedPrescription?.prescription.id])

  const handleBatchSelect = useCallback(
    (batch: DrugInventoryWithDetails) => {
      setSelectedBatch(batch)
      setFormData((prev) => ({
        ...prev,
        inventoryId: batch.id.toString(),
        dispensedQuantity:
          prev.dispensedQuantity || selectedPrescription?.prescription.quantity.toString() || "",
      }))
    },

    [selectedPrescription?.prescription.quantity]
  )

  const handleSubmit = useCallback(() => {
    onSubmit({
      inventoryId: parseInt(formData.inventoryId),
      dispensedQuantity: parseInt(formData.dispensedQuantity),
      fulfilledBy: formData.fulfilledBy,
      notes: formData.notes || undefined,
    })
  }, [formData, onSubmit])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFormData({
        inventoryId: "",
        dispensedQuantity: "",
        fulfilledBy: "",
        notes: "",
      })
      setSelectedBatch(null)
      setAvailableBatches([])
      onOpenChange(false)
    }
  }, [isSubmitting, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto md:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            Proses Resep
            {totalPrescriptions > 1 && (
              <span className="text-muted-foreground ml-2 text-sm">
                ({currentIndex + 1} dari {totalPrescriptions})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {patientName && (
              <div className="text-foreground mb-1 font-medium">Pasien: {patientName}</div>
            )}
            Pilih batch dan isi informasi pengambilan obat
          </DialogDescription>
        </DialogHeader>

        {selectedPrescription && (
          <div className="space-y-4">
            {/* Drug Info */}
            <DrugInfoDisplay
              drugName={selectedPrescription.drug.name}
              genericName={selectedPrescription.drug.genericName}
              quantity={selectedPrescription.prescription.quantity}
              unit={selectedPrescription.drug.unit}
            />

            {/* Batch Selector */}
            <BatchSelector
              isLoading={isLoadingBatches}
              batches={availableBatches}
              selectedBatch={selectedBatch}
              onBatchSelect={handleBatchSelect}
            />

            {/* Fulfillment Form */}
            <FulfillmentForm
              selectedBatch={selectedBatch}
              prescriptionQuantity={selectedPrescription.prescription.quantity}
              unit={selectedPrescription.drug.unit}
              dispensedQuantity={formData.dispensedQuantity}
              fulfilledBy={formData.fulfilledBy}
              notes={formData.notes}
              isSubmitting={isSubmitting}
              onDispensedQuantityChange={(value) =>
                setFormData({ ...formData, dispensedQuantity: value })
              }
              onFulfilledByChange={(value) => setFormData({ ...formData, fulfilledBy: value })}
              onNotesChange={(value) => setFormData({ ...formData, notes: value })}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !selectedBatch ||
                  !formData.dispensedQuantity ||
                  !formData.fulfilledBy
                }
              >
                {isSubmitting
                  ? "Memproses..."
                  : totalPrescriptions > 1 && currentIndex < totalPrescriptions - 1
                    ? "Proses & Lanjut"
                    : "Proses Resep"}
              </Button>
              <Button onClick={handleClose} variant="outline" disabled={isSubmitting}>
                Batal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
