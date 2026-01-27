/**
 * Auto-selected Batch Display Component
 * Shows auto-selected batch info in read-only mode (FEFO)
 */

import { memo } from "react"
import { CheckCircle2, Package, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"

interface AutoBatchDisplayProps {
  selectedBatch: DrugInventoryWithDetails | null
  requiredQuantity: number
  unit: string
  isLoading: boolean
  drugName?: string
}

export const AutoBatchDisplay = memo(function AutoBatchDisplay({
  selectedBatch,
  requiredQuantity,
  unit,
  isLoading,
  drugName,
}: AutoBatchDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-muted/50 flex items-center gap-2 rounded-md p-3">
        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-muted-foreground text-sm">Memilih batch terbaik...</span>
      </div>
    )
  }

  if (!selectedBatch) {
    return (
      <div className="bg-destructive/10 border-destructive flex items-start gap-2 rounded-md border p-3">
        <AlertCircle className="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="text-destructive text-sm font-medium">Tidak ada stok tersedia</p>
          <p className="text-destructive/80 text-xs">
            {drugName ? `"${drugName}"` : "Obat ini"} tidak memiliki batch dengan stok yang cukup.
          </p>
        </div>
      </div>
    )
  }

  const colors = getExpiryAlertColor(selectedBatch.expiryAlertLevel)
  const hasInsufficientStock = selectedBatch.stockQuantity < requiredQuantity

  return (
    <div className={`rounded-md border p-3 ${hasInsufficientStock ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {hasInsufficientStock ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${hasInsufficientStock ? "text-orange-700" : "text-green-700"}`}>
                {hasInsufficientStock ? "Stok Terbatas" : "Batch Terpilih (FEFO)"}
              </span>
              <Badge variant="outline" className="text-xs">
                <Package className="mr-1 h-3 w-3" />
                {selectedBatch.batchNumber}
              </Badge>
            </div>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span>
                Stok:{" "}
                <span className={`font-semibold ${hasInsufficientStock ? "text-orange-700" : "text-foreground"}`}>
                  {selectedBatch.stockQuantity.toLocaleString("id-ID")} {unit}
                </span>
                {hasInsufficientStock && (
                  <span className="text-orange-600"> (butuh: {requiredQuantity})</span>
                )}
              </span>
              <span className={colors.text}>
                Exp: {formatExpiryDate(selectedBatch.expiryDate, selectedBatch.daysUntilExpiry)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
