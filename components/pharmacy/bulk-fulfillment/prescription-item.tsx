import { useState } from "react"
import { ChevronDown, ChevronUp, Beaker, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
      {showSeparator && <div className="border-t" />}

      {/* Drug header row */}
      <div className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{drugName}</p>
            {isCompound && (
              <Badge
                variant="outline"
                className="gap-1 border-purple-200 bg-purple-50 text-xs text-purple-700"
              >
                <Beaker className="h-3 w-3" />
                Racik
              </Badge>
            )}
            {isCompound && compoundRecipe?.code && (
              <Badge variant="secondary" className="font-mono text-xs">
                {compoundRecipe.code}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            <span>{frequency}</span>
            <span>
              {quantity} {unit}
            </span>
            {instructions && <span className="italic">{instructions}</span>}
          </div>
        </div>
      </div>

      {/* Compound: composition breakdown */}
      {isCompound ? (
        <div className="space-y-3 pl-8">
          <Alert className="border-purple-200 bg-purple-50 py-2">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-xs text-purple-700">
              Obat racik akan disiapkan. Jumlah:{" "}
              <span className="font-semibold">
                {quantity} {unit}
              </span>
              . Stok bahan dikurangi otomatis.
            </AlertDescription>
          </Alert>

          {compoundRecipe?.composition && compoundRecipe.composition.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Komposisi (total untuk {quantity} {unit}):
              </p>
              <ul className="space-y-1">
                {compoundRecipe.composition.map((ingredient) => (
                  <li key={ingredient.drugId} className="flex justify-between text-xs">
                    <span>{ingredient.drugName}</span>
                    <span className="text-muted-foreground">
                      {ingredient.quantity} × {quantity} ={" "}
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
        <div className="space-y-2 pl-8">
          <AutoBatchDisplay
            selectedBatch={fulfillmentData?.selectedBatch || null}
            allocatedBatches={fulfillmentData?.allocatedBatches || []}
            requiredQuantity={quantity}
            unit={unit}
            isLoading={fulfillmentData?.isLoading || false}
            drugName={drugName}
          />

          {hasMultipleBatches && !fulfillmentData?.isLoading && (
            <Collapsible open={showManualSelector} onOpenChange={setShowManualSelector}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto px-0 py-1 text-xs">
                  {showManualSelector ? (
                    <>
                      <ChevronUp className="mr-1 h-3.5 w-3.5" />
                      Sembunyikan Pilihan Batch
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3.5 w-3.5" />
                      Ganti Batch Manual ({fulfillmentData?.availableBatches?.length} tersedia)
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

          {!fulfillmentData?.isLoading &&
            !fulfillmentData?.error &&
            fulfillmentData?.allocatedBatches &&
            fulfillmentData.allocatedBatches.length > 0 && (
              <p className="text-muted-foreground text-xs">
                Jumlah diberikan:{" "}
                <span className="text-foreground font-medium">
                  {quantity} {unit}
                </span>
              </p>
            )}
        </div>
      )}
    </div>
  )
}
