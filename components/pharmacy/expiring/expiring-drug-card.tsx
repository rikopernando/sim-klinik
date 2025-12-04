/**
 * Expiring Drug Card Component
 * Reusable card for displaying expiring drug information
 */

import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"

interface Drug {
  name: string
  unit: string
}

interface ExpiringDrug {
  id: string
  batchNumber: string
  expiryDate: Date
  stockQuantity: number
  supplier?: string | null
  expiryAlertLevel: "expired" | "expiring_soon" | "warning"
  daysUntilExpiry: number
  drug: Drug
}

interface ExpiringDrugCardProps {
  inventory: ExpiringDrug
}

const ExpiryBadge = ({ level }: { level: string }) => {
  const labels = {
    expired: "Kadaluarsa",
    expiring_soon: "Segera Kadaluarsa",
    warning: "Perhatian",
  }

  return (
    <Badge className={getExpiryAlertColor(level).badge}>
      {labels[level as keyof typeof labels]}
    </Badge>
  )
}

export const ExpiringDrugCard = memo(function ExpiringDrugCard({
  inventory,
}: ExpiringDrugCardProps) {
  const colors = getExpiryAlertColor(inventory.expiryAlertLevel)

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{inventory.drug.name}</CardTitle>
            <CardDescription>Batch: {inventory.batchNumber}</CardDescription>
          </div>
          <ExpiryBadge level={inventory.expiryAlertLevel} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Tanggal Kadaluarsa</p>
            <p className={`font-medium ${colors.text}`}>
              {formatExpiryDate(inventory.expiryDate, inventory.daysUntilExpiry)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Stok</p>
            <p className="font-medium">
              {inventory.stockQuantity} {inventory.drug.unit}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Supplier</p>
            <p className="font-medium">{inventory.supplier || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
