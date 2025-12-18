/**
 * Batch Selector Component
 * Allows selection of drug batch for fulfillment
 */

import { memo } from "react"
import Link from "next/link"
import { AlertCircle, Package, PlusCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"

interface BatchSelectorProps {
  isLoading: boolean
  batches: DrugInventoryWithDetails[]
  selectedBatch: DrugInventoryWithDetails | null
  onBatchSelect: (batch: DrugInventoryWithDetails) => void
  drugId?: string
  drugName?: string
}

const LoadingState = () => (
  <div className="text-muted-foreground p-4 text-center">Loading batches...</div>
)

const EmptyState = ({ drugId, drugName }: { drugId?: string; drugName?: string }) => (
  <div className="bg-destructive/10 border-destructive rounded-md border p-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-destructive text-sm font-medium">Tidak ada stok tersedia</p>
        <p className="text-destructive/80 mt-1 text-xs">
          {drugName ? `"${drugName}"` : "Obat ini"} tidak memiliki batch dengan stok yang tersedia.
        </p>
      </div>
    </div>
    {drugId && (
      <div className="mt-3">
        <Link href={`/dashboard/pharmacy/inventory?drugId=${drugId}`} target="_blank">
          <Button size="sm" variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Stok Obat Ini
          </Button>
        </Link>
      </div>
    )}
  </div>
)

const BatchCard = memo(function BatchCard({
  batch,
  isSelected,
  onClick,
}: {
  batch: DrugInventoryWithDetails
  isSelected: boolean
  onClick: () => void
}) {
  const colors = getExpiryAlertColor(batch.expiryAlertLevel)

  return (
    <Card
      className={`cursor-pointer py-0 transition-colors ${
        isSelected ? "border-primary ring-primary" : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <Package className="text-muted-foreground h-4 w-4" />
              <p className="font-mono text-sm font-medium">{batch.batchNumber}</p>
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Dipilih
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
              <span>
                Stok:{" "}
                <span className="text-foreground font-semibold">
                  {batch.stockQuantity.toLocaleString("id-ID")} {batch.drug.unit}
                </span>
              </span>
              <span className={colors.text}>
                Exp: {formatExpiryDate(batch.expiryDate, batch.daysUntilExpiry)}
              </span>
            </div>
          </div>
          <Badge className={colors.badge}>
            {batch.expiryAlertLevel === "expiring_soon"
              ? "Segera Exp"
              : batch.expiryAlertLevel === "warning"
                ? "Perhatian"
                : "Aman"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
})

export const BatchSelector = memo(function BatchSelector({
  isLoading,
  batches,
  selectedBatch,
  onBatchSelect,
  drugId,
  drugName,
}: BatchSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>
        Pilih Batch <span className="text-destructive">*</span>
      </Label>
      {isLoading ? (
        <LoadingState />
      ) : batches.length === 0 ? (
        <EmptyState drugId={drugId} drugName={drugName} />
      ) : (
        <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
          {batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              isSelected={selectedBatch?.id === batch.id}
              onClick={() => onBatchSelect(batch)}
            />
          ))}
        </div>
      )}
    </div>
  )
})
