/**
 * Delete Material Confirmation Dialog
 * Reusable dialog for confirming material deletion
 */

import { memo } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MaterialUsage } from "@/types/inpatient"
import { formatCurrency } from "@/lib/utils/billing"

interface DeleteMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: MaterialUsage | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export const DeleteMaterialDialog = memo(function DeleteMaterialDialog({
  open,
  onOpenChange,
  material,
  onConfirm,
  isDeleting,
}: DeleteMaterialDialogProps) {
  if (!material) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Alat Kesehatan?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda yakin ingin menghapus penggunaan Alat Kesehatan{" "}
            <strong>{material.materialName}</strong>?
            <br />
            <br />
            Jumlah: {material.quantity} {material.unit}
            <br />
            Total: {formatCurrency(parseFloat(material.totalPrice))}
            <br />
            <br />
            Aksi ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
