/**
 * Material Usage Card Component
 * Displays history of material/supplies usage
 * Refactored for better modularity and performance
 */

"use client"

import { memo } from "react"
import { IconTrash, IconMedicineSyrup } from "@tabler/icons-react"
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
  isLocked?: boolean
}

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <IconMedicineSyrup className="text-muted-foreground/30 mb-3 h-10 w-10" />
      <p className="text-muted-foreground text-sm">Belum ada penggunaan alat kesehatan</p>
    </div>
  )
})

// Memoized table row component
const MaterialRow = memo(function MaterialRow({
  material,
  canDelete,
  onDeleteClick,
  isLocked,
}: {
  material: MaterialUsage
  canDelete: boolean
  onDeleteClick: (material: MaterialUsage) => void
  isLocked: boolean
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{formatDateTime(material.usedAt)}</TableCell>
      <TableCell>{material.materialName}</TableCell>
      <TableCell className="text-right">{material.quantity}</TableCell>
      <TableCell className="hidden text-right sm:table-cell">
        {formatCurrency(parseFloat(material.unitPrice ?? "0"))}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(parseFloat(material.totalPrice))}
      </TableCell>
      <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
        {material.usedBy || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground hidden max-w-xs truncate text-sm md:table-cell">
        {material.notes || "-"}
      </TableCell>
      <TableCell>
        {canDelete && !isLocked && (
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
  isLocked = false,
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Waktu Pakai
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Nama Alat Kesehatan
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                Jumlah
              </TableHead>
              <TableHead className="hidden text-right text-xs font-semibold tracking-wider uppercase sm:table-cell">
                Harga Satuan
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                Total Harga
              </TableHead>
              <TableHead className="hidden text-xs font-semibold tracking-wider uppercase md:table-cell">
                Digunakan Oleh
              </TableHead>
              <TableHead className="hidden text-xs font-semibold tracking-wider uppercase md:table-cell">
                Catatan
              </TableHead>
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
                isLocked={isLocked}
              />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total Biaya
              </TableCell>
              <TableCell className="hidden sm:table-cell" />
              <TableCell className="text-right text-lg font-bold">
                Rp {new Intl.NumberFormat("id-ID").format(parseFloat(totalCost))}
              </TableCell>
              <TableCell className="hidden md:table-cell" colSpan={2} />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

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
