/**
 * Inventory Table Component
 * Displays drug inventory in table format
 */

import { IconSearch } from "@tabler/icons-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { InventoryPagination } from "./inventory-pagination"

interface InventoryTableProps {
  inventories: DrugInventoryWithDetails[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

const LoadingState = () => <div className="text-muted-foreground py-8 text-center">Loading...</div>

const ErrorState = ({ error }: { error: string }) => (
  <div className="py-8 text-center text-red-600">Error: {error}</div>
)

const EmptyState = () => (
  <div className="text-muted-foreground py-8 text-center">
    Belum ada stok obat. Tambahkan stok baru.
  </div>
)

const getStockBadge = (quantity: number) => {
  if (quantity === 0) {
    return <Badge variant="destructive">Habis</Badge>
  }
  if (quantity < 10) {
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
        Rendah
      </Badge>
    )
  }
  return <Badge variant="outline">Tersedia</Badge>
}

const getExpiryBadge = (level: ExpiryAlertLevel) => {
  const colors = getExpiryAlertColor(level)
  const labels = {
    expired: "Kadaluarsa",
    expiring_soon: "Segera Kadaluarsa",
    warning: "Perhatian",
    ok: "Aman",
  }

  return <Badge className={colors.badge}>{labels[level as keyof typeof labels] || "Aman"}</Badge>
}

export function InventoryTableRow({ inventory }: { inventory: DrugInventoryWithDetails }) {
  const expiryColors = getExpiryAlertColor(inventory.expiryAlertLevel)
  return (
    <TableRow>
      <TableCell className="py-3 font-medium">{inventory.drug.name}</TableCell>
      <TableCell className="text-muted-foreground py-3">
        {inventory.drug.genericName || "-"}
      </TableCell>
      <TableCell className="py-3 font-mono text-sm">{inventory.batchNumber}</TableCell>
      <TableCell className="py-3">
        <span className="font-semibold">{inventory.stockQuantity.toLocaleString("id-ID")}</span>{" "}
        {inventory.drug.unit}
      </TableCell>
      <TableCell className="py-3">
        <span className={expiryColors.text}>
          {formatExpiryDate(inventory.expiryDate, inventory.daysUntilExpiry)}
        </span>
      </TableCell>
      <TableCell className="py-3">{getStockBadge(inventory.stockQuantity)}</TableCell>
      <TableCell className="py-3">{getExpiryBadge(inventory.expiryAlertLevel)}</TableCell>
      <TableCell className="py-3">{inventory.supplier || "-"}</TableCell>
    </TableRow>
  )
}

export function InventoryTable({
  inventories,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  pagination,
  onPageChange,
}: InventoryTableProps) {
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Stok Obat</CardTitle>
        {pagination.total > 0 && <CardDescription>Total: {pagination.total} batch</CardDescription>}
        <CardAction>
          <div className="relative flex-1">
            <IconSearch
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
              size={20}
            />
            <Input
              placeholder="Cari berdasarkan nama obat"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-[304px] pl-10"
            />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {inventories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead>Nama Generik</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Tanggal Kadaluarsa</TableHead>
                    <TableHead>Status Stok</TableHead>
                    <TableHead>Status Kadaluarsa</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventories.map((inventory) => (
                    <InventoryTableRow key={inventory.id} inventory={inventory} />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <InventoryPagination pagination={pagination} onPageChange={onPageChange} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
