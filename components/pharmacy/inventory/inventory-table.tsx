import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"
import { ExpiryAlertLevel } from "@/types/pharmacy"

const getStockBadge = (quantity: number) => {
  if (quantity === 0)
    return (
      <Badge variant="destructive" className="text-xs">
        Habis
      </Badge>
    )
  if (quantity < 10)
    return (
      <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-xs text-yellow-700">
        Rendah
      </Badge>
    )
  return (
    <Badge variant="outline" className="text-xs">
      Tersedia
    </Badge>
  )
}

const getExpiryBadge = (level: ExpiryAlertLevel) => {
  const colors = getExpiryAlertColor(level)
  const labels: Record<string, string> = {
    expired: "Kadaluarsa",
    expiring_soon: "Segera Exp",
    warning: "Perhatian",
    safe: "Aman",
  }
  return <Badge className={`${colors.badge} text-xs`}>{labels[level] ?? "Aman"}</Badge>
}

function InventoryTableRow({ inventory }: { inventory: DrugInventoryWithDetails }) {
  const expiryColors = getExpiryAlertColor(inventory.expiryAlertLevel)
  return (
    <TableRow className="group transition-colors">
      <TableCell className="py-3 font-medium">{inventory.drug.name}</TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">
        {inventory.drug.genericName || "—"}
      </TableCell>
      <TableCell className="py-3">
        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
          {inventory.batchNumber}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <span className="font-semibold">{inventory.stockQuantity.toLocaleString("id-ID")}</span>{" "}
        <span className="text-muted-foreground text-xs">{inventory.drug.unit}</span>
      </TableCell>
      <TableCell className="py-3">
        <span className={`text-sm ${expiryColors.text}`}>
          {formatExpiryDate(inventory.expiryDate, inventory.daysUntilExpiry)}
        </span>
      </TableCell>
      <TableCell className="py-3">{getStockBadge(inventory.stockQuantity)}</TableCell>
      <TableCell className="py-3">{getExpiryBadge(inventory.expiryAlertLevel)}</TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">
        {inventory.supplier || "—"}
      </TableCell>
    </TableRow>
  )
}

interface InventoryTableProps {
  inventories: DrugInventoryWithDetails[]
}

export function InventoryTable({ inventories }: InventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Nama Obat
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Nama Generik
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Batch</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Stok</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Tgl Kadaluarsa
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Status Stok
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Status Exp
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Supplier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventories.map((inventory) => (
          <InventoryTableRow key={inventory.id} inventory={inventory} />
        ))}
      </TableBody>
    </Table>
  )
}
