/**
 * Custom hook for managing bulk fulfillment data and batch loading
 */

import { useState, useEffect, useCallback } from "react"
import {
  getAvailableBatches,
  type DrugInventoryWithDetails,
} from "@/lib/services/inventory.service"
import { PrescriptionQueueItem } from "@/types/pharmacy"

export interface FulfillmentFormData {
  inventoryId: string
  dispensedQuantity: number
  availableBatches: DrugInventoryWithDetails[]
  selectedBatch: DrugInventoryWithDetails | null
  isLoading: boolean
  error: string | null
}

export function useBulkFulfillmentData(open: boolean, selectedGroup: PrescriptionQueueItem | null) {
  const [fulfillmentData, setFulfillmentData] = useState<Record<string, FulfillmentFormData>>({})

  // Load batches for all prescriptions when dialog opens
  useEffect(() => {
    if (!open || !selectedGroup) return
    let ignore = false

    const loadBatches = async () => {
      const newData: Record<string, FulfillmentFormData> = {}

      // Initialize all prescriptions with loading state
      for (const item of selectedGroup.prescriptions) {
        newData[item.prescription.id] = {
          inventoryId: "",
          dispensedQuantity: item.prescription.quantity,
          availableBatches: [],
          selectedBatch: null,
          isLoading: true,
          error: null,
        }
      }

      setFulfillmentData(newData)

      // Load batches for each drug
      for (const item of selectedGroup.prescriptions) {
        try {
          const batches = await getAvailableBatches(item.drug.id)
          const [firstBatch] = batches || []

          if (!ignore) {
            setFulfillmentData((prev) => ({
              ...prev,
              [item.prescription.id]: {
                ...prev[item.prescription.id],
                availableBatches: batches,
                selectedBatch: firstBatch,
                inventoryId: firstBatch ? firstBatch.id : "",
                isLoading: false,
              },
            }))
          }
        } catch {
          if (!ignore) {
            setFulfillmentData((prev) => ({
              ...prev,
              [item.prescription.id]: {
                ...prev[item.prescription.id],
                isLoading: false,
                error: "Gagal memuat batch",
              },
            }))
          }
        }
      }
    }

    loadBatches()
    return () => {
      ignore = true
    }
  }, [open, selectedGroup])

  const handleBatchSelect = useCallback(
    (prescriptionId: string, batch: DrugInventoryWithDetails) => {
      setFulfillmentData((prev) => ({
        ...prev,
        [prescriptionId]: {
          ...prev[prescriptionId],
          selectedBatch: batch,
          inventoryId: batch.id,
        },
      }))
    },
    []
  )

  const reset = useCallback(() => {
    setFulfillmentData({})
  }, [])

  return {
    fulfillmentData,
    handleBatchSelect,
    reset,
  }
}
