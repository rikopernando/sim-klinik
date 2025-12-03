"use client"

/**
 * Pharmacy Inventory Management Page (Refactored)
 * Manage drug stock with batch numbers and expiry dates
 */

import { useState, useMemo, useCallback } from "react"
import { useInventory } from "@/hooks/use-inventory"
import { AddInventoryDialog } from "@/components/pharmacy/add-inventory-dialog"
import { InventoryHeader } from "@/components/pharmacy/inventory/inventory-header"
import { InventoryStats } from "@/components/pharmacy/inventory/inventory-stats"
import { InventoryTable } from "@/components/pharmacy/inventory/inventory-table"

export default function InventoryPage() {
  const { inventories, isLoading, error, refresh } = useInventory()
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Calculate statistics with memoization
  const stats = useMemo(() => {
    return {
      totalBatches: inventories.length,
      expiredCount: inventories.filter((i) => i.expiryAlertLevel === "expired").length,
      expiringSoonCount: inventories.filter((i) => i.expiryAlertLevel === "expiring_soon").length,
      lowStockCount: inventories.filter((i) => i.stockQuantity < 10 && i.stockQuantity > 0).length,
    }
  }, [inventories])

  // Handlers
  const handleAddSuccess = useCallback(() => {
    refresh()
  }, [refresh])

  const handleAddStock = useCallback(() => {
    setShowAddDialog(true)
  }, [])

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <InventoryHeader onRefresh={refresh} onAddStock={handleAddStock} isLoading={isLoading} />

      {/* Stats */}
      <InventoryStats
        totalBatches={stats.totalBatches}
        expiredCount={stats.expiredCount}
        expiringSoonCount={stats.expiringSoonCount}
        lowStockCount={stats.lowStockCount}
      />

      {/* Inventory Table */}
      <InventoryTable inventories={inventories} isLoading={isLoading} error={error} />

      {/* Add Inventory Dialog */}
      <AddInventoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
