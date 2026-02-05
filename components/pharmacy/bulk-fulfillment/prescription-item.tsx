/**
 * Prescription Item Component
 * Displays individual prescription with auto-selected batch (FEFO)
 * Manual multi-batch selection is hidden by default but can be expanded
 */

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BatchSelector } from "@/components/pharmacy/fulfillment/batch-selector"
import { AutoBatchDisplay } from "@/components/pharmacy/fulfillment/auto-batch-display"
import type { FulfillmentFormData } from "@/components/pharmacy/hooks/use-bulk-fulfillment-data"
import type { BatchAllocation } from "@/lib/pharmacy/stock-utils"

interface PrescriptionItemProps {
  index: number
  drugId: string
  drugName: string
  genericName?: string | null
  frequency: string
  quantity: number
  unit: string
  fulfillmentData: FulfillmentFormData | undefined
  onAllocationsChange: (allocations: BatchAllocation[]) => void
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
  onAllocationsChange,
  showSeparator = false,
}: PrescriptionItemProps) {
  const [showManualSelector, setShowManualSelector] = useState(false)
  const hasMultipleBatches = (fulfillmentData?.availableBatches?.length || 0) > 1

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

      {/* Auto-selected Batch Display */}
      <div className="ml-8">
        <AutoBatchDisplay
          selectedBatch={fulfillmentData?.selectedBatch || null}
          allocatedBatches={fulfillmentData?.allocatedBatches || []}
          requiredQuantity={quantity}
          unit={unit}
          isLoading={fulfillmentData?.isLoading || false}
          drugName={drugName}
        />

        {/* Manual Multi-Batch Selection (Collapsible) */}
        {hasMultipleBatches && !fulfillmentData?.isLoading && (
          <Collapsible open={showManualSelector} onOpenChange={setShowManualSelector}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-2 h-auto px-0 py-1">
                {showManualSelector ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Sembunyikan Pilihan Batch
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Ganti Batch Manual ({fulfillmentData?.availableBatches?.length} batch tersedia)
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <BatchSelector
                isLoading={fulfillmentData?.isLoading || false}
                batches={fulfillmentData?.availableBatches || []}
                allocatedBatches={fulfillmentData?.allocatedBatches || []}
                requiredQuantity={quantity}
                unit={unit}
                onAllocationsChange={onAllocationsChange}
                drugId={drugId}
                drugName={drugName}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Display Prescription Quantity (Read-only) */}
      {!fulfillmentData?.isLoading &&
        !fulfillmentData?.error &&
        fulfillmentData?.allocatedBatches &&
        fulfillmentData.allocatedBatches.length > 0 && (
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
