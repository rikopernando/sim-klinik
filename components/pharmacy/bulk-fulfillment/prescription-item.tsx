/**
 * Prescription Item Component
 * Displays individual prescription with batch selector
 */

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"
import { BatchSelector } from "@/components/pharmacy/fulfillment/batch-selector"
import type { FulfillmentFormData } from "@/components/pharmacy/hooks/use-bulk-fulfillment-data"

interface PrescriptionItemProps {
  index: number
  drugId: string
  drugName: string
  genericName?: string | null
  frequency: string
  quantity: number
  unit: string
  fulfillmentData: FulfillmentFormData | undefined
  onBatchSelect: (batch: DrugInventoryWithDetails) => void
  showSeparator?: boolean
}

export function PrescriptionItem({
  index,
  drugId,
  drugName,
  genericName,
  frequency,
  quantity,
  unit,
  fulfillmentData,
  onBatchSelect,
  showSeparator = false,
}: PrescriptionItemProps) {
  return (
    <div className="space-y-3">
      {showSeparator && <Separator />}

      {/* Drug Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge>{index + 1}</Badge>
            <h4 className="font-semibold">{drugName}</h4>
          </div>
          {genericName && <p className="text-muted-foreground ml-8 text-sm">{genericName}</p>}
          <div className="text-muted-foreground mt-1 ml-8 flex justify-between gap-4 text-sm">
            <span>Frekuensi: {frequency}</span>
            <span>
              Jumlah Resep: {quantity} {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Selector */}
      <div className="ml-8">
        <BatchSelector
          isLoading={fulfillmentData?.isLoading || false}
          batches={fulfillmentData?.availableBatches || []}
          selectedBatch={fulfillmentData?.selectedBatch || null}
          onBatchSelect={onBatchSelect}
          drugId={drugId}
          drugName={drugName}
        />
      </div>

      {/* Display Prescription Quantity (Read-only) */}
      {!fulfillmentData?.isLoading && !fulfillmentData?.error && fulfillmentData?.selectedBatch && (
        <div className="ml-8">
          <p className="text-muted-foreground text-sm">
            Jumlah Diberikan:{" "}
            <span className="text-foreground font-medium">
              {quantity} {unit}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
