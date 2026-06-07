import { memo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"
import { DrugInventoryWithDetails, ExpiryAlertLevel } from "@/types/pharmacy"

interface ExpiringDrugCardProps {
  inventory: DrugInventoryWithDetails
}

const EXPIRY_LABELS: Record<ExpiryAlertLevel, string> = {
  expired: "Kadaluarsa",
  expiring_soon: "Segera Exp",
  warning: "Perhatian",
  safe: "Aman",
}

export const ExpiringDrugCard = memo(function ExpiringDrugCard({
  inventory,
}: ExpiringDrugCardProps) {
  const colors = getExpiryAlertColor(inventory.expiryAlertLevel)
  const label = EXPIRY_LABELS[inventory.expiryAlertLevel]

  return (
    <div className="hover:bg-muted/30 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{inventory.drug.name}</p>
          <Badge className={`${colors.badge} shrink-0 text-xs`}>{label}</Badge>
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
          <span>
            Batch: <span className="text-foreground font-medium">{inventory.batchNumber}</span>
          </span>
          <span className={colors.text}>
            Exp: {formatExpiryDate(inventory?.expiryDate, inventory.daysUntilExpiry)}
          </span>
          <span>
            Stok:{" "}
            <span className="text-foreground font-medium">
              {inventory.stockQuantity} {inventory.drug.unit}
            </span>
          </span>
          {inventory.supplier && <span>Supplier: {inventory.supplier}</span>}
        </div>
      </div>
      <Link
        href={`/dashboard/pharmacy/inventory?search=${encodeURIComponent(inventory.drug.name)}`}
        target="_blank"
      >
        <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs">
          Inventaris
        </Button>
      </Link>
    </div>
  )
})
