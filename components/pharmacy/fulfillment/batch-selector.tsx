import { memo, useState, useCallback } from "react"
import Link from "next/link"
import { AlertCircle, Package, PlusCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  <div className="text-muted-foreground p-3 text-center text-xs">Memuat batch...</div>
)

const EmptyState = ({ drugId, drugName }: { drugId?: string; drugName?: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
    <div className="flex items-start gap-2">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-xs font-medium text-red-700">Tidak ada stok tersedia</p>
        <p className="mt-0.5 text-xs text-red-600">
          {drugName ? `"${drugName}"` : "Obat ini"} tidak memiliki batch dengan stok tersedia.
        </p>
      </div>
    </div>
    {drugId && (
      <Link
        href={`/dashboard/pharmacy/inventory?drugId=${drugId}`}
        target="_blank"
        className="mt-2 block"
      >
        <Button size="sm" variant="outline" className="h-7 w-full text-xs">
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Tambah Stok
        </Button>
      </Link>
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
        const currentTotal = allocatedBatches.reduce((sum, a) => sum + a.quantity, 0)
        const autoQty = Math.min(batch.stockQuantity, Math.max(requiredQuantity - currentTotal, 1))
        const newAllocations = [...allocatedBatches, { batch, quantity: autoQty }]
        setQuantities((prev) => ({ ...prev, [batch.id]: autoQty }))
        onAllocationsChange(newAllocations)
      } else {
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
    <div className="space-y-2">
      <Label className="text-xs">
        Pilih Batch <span className="text-destructive">*</span>
      </Label>

      <div className="max-h-48 space-y-1.5 overflow-y-auto">
        {batches.map((batch) => {
          const isSelected = selectedIds.has(batch.id)
          const colors = getExpiryAlertColor(batch.expiryAlertLevel)
          const qty = quantities[batch.id] ?? 0

          return (
            <div
              key={batch.id}
              className={`rounded-lg border p-2.5 transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleToggle(batch, !!checked)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Package className="text-muted-foreground h-3.5 w-3.5" />
                      <p className="font-mono text-xs font-medium">{batch.batchNumber}</p>
                    </div>
                    <Badge className={`${colors.badge} text-xs`}>
                      {batch.expiryAlertLevel === "expiring_soon"
                        ? "Segera Exp"
                        : batch.expiryAlertLevel === "warning"
                          ? "Perhatian"
                          : "Aman"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                    <span>
                      Stok:{" "}
                      <span className="text-foreground font-medium">
                        {batch.stockQuantity.toLocaleString("id-ID")} {unit}
                      </span>
                    </span>
                    <span className={colors.text}>
                      Exp: {formatExpiryDate(batch.expiryDate, batch.daysUntilExpiry)}
                    </span>
                  </div>

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
                        className="h-6 w-20 text-xs"
                      />
                      <span className="text-muted-foreground text-xs">
                        / {batch.stockQuantity} {unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className={`rounded-md px-3 py-2 text-xs font-medium ${
          remaining > 0
            ? "bg-orange-50 text-orange-700"
            : remaining === 0
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
        }`}
      >
        Total: <span className="font-bold">{totalAllocated}</span> / {requiredQuantity} {unit}
        {remaining > 0 && <span className="ml-2 opacity-80">(kurang {remaining})</span>}
        {remaining < 0 && (
          <span className="ml-2 opacity-80">(kelebihan {Math.abs(remaining)})</span>
        )}
      </div>
    </div>
  )
})
