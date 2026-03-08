/**
 * Custom hook for managing bulk fulfillment data and batch loading
 * Uses FEFO (First Expiry, First Out) for automatic batch selection
 * Supports multi-batch allocation when no single batch has enough stock
 */

import { useState, useEffect, useCallback } from "react"
import {
  getAvailableBatches,
  type DrugInventoryWithDetails,
} from "@/lib/services/inventory.service"
import { PrescriptionQueueItem } from "@/types/pharmacy"
import {
  allocateBatchesForDispensing,
  getAvailableStock,
  type BatchAllocation,
} from "@/lib/pharmacy/stock-utils"

export interface FulfillmentFormData {
  inventoryId: string
  dispensedQuantity: number
  availableBatches: DrugInventoryWithDetails[]
  selectedBatch: DrugInventoryWithDetails | null
  allocatedBatches: BatchAllocation[]
  totalAvailableStock: number
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
          allocatedBatches: [],
          totalAvailableStock: 0,
          isLoading: true,
          error: null,
        }
      }

      setFulfillmentData(newData)

      // Load batches for each drug
      for (const item of selectedGroup.prescriptions) {
        try {
          const batches = await getAvailableBatches(item.drug.id)
          const allocations = allocateBatchesForDispensing(batches, item.prescription.quantity)
          const totalStock = getAvailableStock(batches)
          const primaryBatch = allocations.length > 0 ? allocations[0].batch : null

          if (!ignore) {
            setFulfillmentData((prev) => ({
              ...prev,
              [item.prescription.id]: {
                ...prev[item.prescription.id],
                availableBatches: batches,
                selectedBatch: primaryBatch,
                inventoryId: primaryBatch ? primaryBatch.id : "",
                allocatedBatches: allocations,
                totalAvailableStock: totalStock,
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

  const handleAllocationsChange = useCallback(
    (prescriptionId: string, allocations: BatchAllocation[]) => {
      setFulfillmentData((prev) => {
        const primaryBatch = allocations.length > 0 ? allocations[0].batch : null
        return {
          ...prev,
          [prescriptionId]: {
            ...prev[prescriptionId],
            selectedBatch: primaryBatch,
            inventoryId: primaryBatch ? primaryBatch.id : "",
            allocatedBatches: allocations,
          },
        }
      })
    },
    []
  )

  const reset = useCallback(() => {
    setFulfillmentData({})
  }, [])

  return {
    fulfillmentData,
    handleAllocationsChange,
    reset,
  }
}
