/**
 * Inventory Header Component
 */

import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"

interface InventoryHeaderProps {
  onRefresh: () => void
  onAddStock: () => void
  isLoading?: boolean
}

export function InventoryHeader({
  onRefresh,
  onAddStock,
  isLoading = false,
}: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Stok Obat</h1>
        <p className="text-muted-foreground">
          Kelola inventaris obat dengan batch number dan tanggal kadaluarsa
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={onAddStock}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Stok
        </Button>
      </div>
    </div>
  )
}
