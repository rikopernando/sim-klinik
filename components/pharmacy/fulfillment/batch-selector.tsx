/**
 * Batch Selector Component
 * Supports multi-batch selection with checkboxes and quantity inputs
 */

import { memo, useState, useCallback } from "react"
import Link from "next/link"
import { AlertCircle, Package, PlusCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  formatExpiryDate,
  getExpiryAlertColor,
  type BatchAllocation,
} from "@/lib/pharmacy/stock-utils"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"

interface BatchSelectorProps {
  isLoading: boolean
  batches: DrugInventoryWithDetails[]
  allocatedBatches: BatchAllocation[]
  requiredQuantity: number
  unit: string
  onAllocationsChange: (allocations: BatchAllocation[]) => void
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

export const BatchSelector = memo(function BatchSelector({
  isLoading,
  batches,
  allocatedBatches,
  requiredQuantity,
  unit,
  onAllocationsChange,
  drugId,
  drugName,
}: BatchSelectorProps) {
  // Track per-batch quantity inputs locally for responsiveness
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const alloc of allocatedBatches) {
      init[alloc.batch.id] = alloc.quantity
    }
    return init
  })

  const selectedIds = new Set(allocatedBatches.map((a) => a.batch.id))
  const totalAllocated = allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
  const remaining = requiredQuantity - totalAllocated

  const handleToggle = useCallback(
    (batch: DrugInventoryWithDetails, checked: boolean) => {
      if (checked) {
        // Add batch - auto-fill with min(stock, remaining)
        const currentTotal = allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
        const autoQty = Math.min(batch.stockQuantity, Math.max(requiredQuantity - currentTotal, 1))
        const newAllocations = [...allocatedBatches, { batch, quantity: autoQty }]
        setQuantities((prev) => ({ ...prev, [batch.id]: autoQty }))
        onAllocationsChange(newAllocations)
      } else {
        // Remove batch
        const newAllocations = allocatedBatches.filter((a) => a.batch.id !== batch.id)
        onAllocationsChange(newAllocations)
      }
    },
    [allocatedBatches, requiredQuantity, onAllocationsChange]
  )

  const handleQuantityChange = useCallback(
    (batchId: string, value: number) => {
      const batch = batches.find((b) => b.id === batchId)
      if (!batch) return

      const clamped = Math.max(0, Math.min(value, batch.stockQuantity))
      setQuantities((prev) => ({ ...prev, [batchId]: clamped }))

      const newAllocations = allocatedBatches.map((a) =>
        a.batch.id === batchId ? { ...a, quantity: clamped } : a
      )
      onAllocationsChange(newAllocations)
    },
    [batches, allocatedBatches, onAllocationsChange]
  )

  if (isLoading) return <LoadingState />
  if (batches.length === 0) return <EmptyState drugId={drugId} drugName={drugName} />

  return (
    <div className="space-y-3">
      <Label>
        Pilih Batch <span className="text-destructive">*</span>
      </Label>

      <div className="max-h-60 space-y-2 overflow-y-auto">
        {batches.map((batch) => {
          const isSelected = selectedIds.has(batch.id)
          const colors = getExpiryAlertColor(batch.expiryAlertLevel)
          const qty = quantities[batch.id] ?? 0

          return (
            <Card
              key={batch.id}
              className={`py-0 transition-colors ${
                isSelected ? "border-primary ring-primary" : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleToggle(batch, !!checked)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="text-muted-foreground h-4 w-4" />
                      <p className="font-mono text-sm font-medium">{batch.batchNumber}</p>
                      <Badge className={colors.badge}>
                        {batch.expiryAlertLevel === "expiring_soon"
                          ? "Segera Exp"
                          : batch.expiryAlertLevel === "warning"
                            ? "Perhatian"
                            : "Aman"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                      <span>
                        Stok:{" "}
                        <span className="text-foreground font-semibold">
                          {batch.stockQuantity.toLocaleString("id-ID")} {unit}
                        </span>
                      </span>
                      <span className={colors.text}>
                        Exp: {formatExpiryDate(batch.expiryDate, batch.daysUntilExpiry)}
                      </span>
                    </div>

                    {/* Quantity input when selected */}
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-2">
                        <Label className="text-xs whitespace-nowrap">Ambil:</Label>
                        <Input
                          type="number"
                          min={1}
                          max={batch.stockQuantity}
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(batch.id, parseInt(e.target.value) || 0)
                          }
                          className="h-7 w-24 text-sm"
                        />
                        <span className="text-muted-foreground text-xs">
                          / {batch.stockQuantity} {unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Running total */}
      <div
        className={`rounded-md p-2 text-sm ${
          remaining > 0
            ? "bg-orange-50 text-orange-700"
            : remaining === 0
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
        }`}
      >
        Total: <span className="font-semibold">{totalAllocated}</span> / {requiredQuantity} {unit}
        {remaining > 0 && <span className="ml-2">(kurang {remaining})</span>}
        {remaining < 0 && <span className="ml-2">(kelebihan {Math.abs(remaining)})</span>}
      </div>
    </div>
  )
})
