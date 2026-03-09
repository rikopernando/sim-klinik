/**
 * Prescription Item Component
 * Displays individual prescription with auto-selected batch (FEFO)
 * Manual multi-batch selection is hidden by default but can be expanded
 * Supports both regular drugs and compound recipes
 */

import { useState } from "react"
import { ChevronDown, ChevronUp, Beaker, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BatchSelector } from "@/components/pharmacy/fulfillment/batch-selector"
import { AutoBatchDisplay } from "@/components/pharmacy/fulfillment/auto-batch-display"
import type { FulfillmentFormData } from "@/components/pharmacy/hooks/use-bulk-fulfillment-data"
import type { BatchAllocation } from "@/lib/pharmacy/stock-utils"
import type { CompoundRecipeBasic } from "@/types/pharmacy"

interface PrescriptionItemProps {
  index: number
  drugId: string
  drugName: string
  frequency: string
  quantity: number
  unit: string
  instructions: string | null
  fulfillmentData: FulfillmentFormData | undefined
  onAllocationsChange: (allocations: BatchAllocation[]) => void
  showSeparator?: boolean
  isCompound?: boolean
  compoundRecipe?: CompoundRecipeBasic | null
}

export function PrescriptionItem({
  index,
  drugId,
  drugName,
  frequency,
  quantity,
  unit,
  instructions,
  fulfillmentData,
  onAllocationsChange,
  showSeparator = false,
  isCompound = false,
  compoundRecipe,
}: PrescriptionItemProps) {
  const [showManualSelector, setShowManualSelector] = useState(false)
  const hasMultipleBatches = (fulfillmentData?.availableBatches?.length || 0) > 1

  return (
    <div className="space-y-3">
      {showSeparator && <Separator />}

      {/* Drug/Compound Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge>{index + 1}</Badge>
            {isCompound && (
              <Badge
                variant="outline"
                className="gap-1 border-purple-300 bg-purple-50 text-purple-700"
              >
                <Beaker className="h-3 w-3" />
                Obat Racik
              </Badge>
            )}
            <h4 className="font-semibold">{drugName}</h4>
            {isCompound && compoundRecipe?.code && (
              <Badge variant="secondary" className="font-mono text-xs">
                {compoundRecipe.code}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground mt-1 ml-8 flex flex-col gap-1 text-sm">
            <span>Frekuensi: {frequency}</span>
            <span>
              Jumlah Resep: {quantity} {unit}
            </span>
            <span>Instruksi Tambahan: {instructions || "-"}</span>
          </div>
        </div>
      </div>

      {/* Compound Recipe: Show composition breakdown */}
      {isCompound ? (
        <div className="ml-8 space-y-3">
          <Alert className="border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="block text-purple-700">
              Obat racik akan disiapkan. Jumlah:{" "}
              <span className="font-semibold">
                {quantity} {unit}
              </span>
              . Stok bahan akan dikurangi otomatis.
            </AlertDescription>
          </Alert>

          {/* Show ingredient composition with calculated totals */}
          {compoundRecipe?.composition && compoundRecipe.composition.length > 0 && (
            <div className="rounded-md border p-3">
              <h5 className="text-muted-foreground mb-2 text-sm font-medium">
                Komposisi (total untuk {quantity} {unit}):
              </h5>
              <ul className="space-y-1 text-sm">
                {compoundRecipe.composition.map((ingredient) => (
                  <li key={ingredient.drugId} className="flex justify-between">
                    <span>{ingredient.drugName}</span>
                    <span className="text-muted-foreground">
                      {ingredient.quantity} x {quantity} ={" "}
                      <span className="text-foreground font-medium">
                        {ingredient.quantity * quantity} {ingredient.unit}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Auto-selected Batch Display (Regular Drugs Only) */}
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
                        Ganti Batch Manual ({fulfillmentData?.availableBatches?.length} batch
                        tersedia)
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
        </>
      )}
    </div>
  )
}
