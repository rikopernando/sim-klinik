/**
 * Material Usage Card Component
 * Displays history of material/supplies usage
 * Refactored for better modularity and performance
 */

"use client"

import { memo } from "react"
import { IconTrash } from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DeleteMaterialDialog } from "./delete-material-dialog"
import { MaterialUsage } from "@/types/inpatient"
import { formatCurrency } from "@/lib/utils/billing"
import { formatDateTime } from "@/lib/utils/date"
import { useMaterialDelete } from "@/hooks/use-material-delete"

interface MaterialUsageCardProps {
  materials: MaterialUsage[]
  totalCost: string
  onRefresh?: () => void
}

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
  return <div className="text-muted-foreground py-8 text-center">Belum ada penggunaan material</div>
})

// Memoized table row component
const MaterialRow = memo(function MaterialRow({
  material,
  canDelete,
  onDeleteClick,
}: {
  material: MaterialUsage
  canDelete: boolean
  onDeleteClick: (material: MaterialUsage) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{formatDateTime(material.usedAt)}</TableCell>
      <TableCell>{material.materialName}</TableCell>
      <TableCell className="text-right">{material.quantity}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(parseFloat(material.unitPrice ?? "0"))}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(parseFloat(material.totalPrice))}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">{material.usedBy || "-"}</TableCell>
      <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
        {material.notes || "-"}
      </TableCell>
      <TableCell>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(material)}
            className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
})

export const MaterialUsageCard = memo(function MaterialUsageCard({
  materials,
  totalCost,
  onRefresh,
}: MaterialUsageCardProps) {
  const {
    deleteDialogOpen,
    materialToDelete,
    isDeleting,
    canDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useMaterialDelete({ onSuccess: onRefresh })

  if (materials.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu Pakai</TableHead>
            <TableHead>Nama Alat Kesehatan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Total Harga</TableHead>
            <TableHead>Digunakan Oleh</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              canDelete={canDelete(material.usedAt)}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-semibold">
              Total Biaya
            </TableCell>
            <TableCell className="text-right text-lg font-bold">
              Rp {new Intl.NumberFormat("id-ID").format(parseFloat(totalCost))}
            </TableCell>
            <TableCell colSpan={3} />
          </TableRow>
        </TableFooter>
      </Table>

      {/* Delete Confirmation Dialog */}
      <DeleteMaterialDialog
        open={deleteDialogOpen}
        onOpenChange={handleCancelDelete}
        material={materialToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
})
