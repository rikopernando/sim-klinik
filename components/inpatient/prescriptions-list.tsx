"use client"

import { memo, useMemo, useState } from "react"
import { IconPill, IconTrash, IconCheck, IconClock } from "@tabler/icons-react"
import { Beaker } from "lucide-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InpatientPrescription } from "@/types/inpatient"
import { formatDateTime } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"
import {
  administerPrescription,
  deleteInpatientPrescription,
} from "@/lib/services/inpatient.service"
import { useSession } from "@/lib/auth-client"
import { MEDICATION_ROUTES } from "@/types/medical-record"

interface PrescriptionsListProps {
  prescriptions: InpatientPrescription[]
  onRefresh?: () => void
  isLocked?: boolean
}

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <IconPill className="text-muted-foreground/30 mb-3 h-10 w-10" />
      <p className="text-muted-foreground text-sm">Belum ada resep obat</p>
    </div>
  )
})

const PrescriptionRow = memo(function PrescriptionRow({
  prescription,
  onAdminister,
  onDeleteRequest,
  isNurse,
  isLoading,
  isLocked,
}: {
  prescription: InpatientPrescription
  onAdminister: (id: string) => void
  onDeleteRequest: (id: string) => void
  isNurse: boolean
  isLoading: boolean
  isLocked: boolean
}) {
  const medicationRoute = MEDICATION_ROUTES.find((item) => item.value === prescription.route)
  const medicationName = prescription.isCompound
    ? prescription.compoundRecipeName
    : prescription.drugName
  const medicationPrice = prescription.isCompound
    ? prescription.compoundRecipePrice
    : prescription.drugPrice

  return (
    <TableRow>
      {/* Obat + jenis */}
      <TableCell className="py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {prescription.isCompound ? (
            <Badge
              variant="outline"
              className="gap-1 border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300"
            >
              <Beaker className="h-3 w-3" />
              Racik
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Tunggal
            </Badge>
          )}
          <span className="font-medium">{medicationName || "-"}</span>
        </div>
        <div className="text-muted-foreground mt-0.5 text-xs">
          {prescription.isRecurring ? "Rutin" : "Sekali pakai"}
          {medicationRoute && ` · ${medicationRoute.label}`}
        </div>
      </TableCell>

      {/* Dosis & Frekuensi */}
      <TableCell className="py-3">
        <div className="text-sm">{prescription.dosage}</div>
        <div className="text-muted-foreground text-xs">{prescription.frequency}</div>
      </TableCell>

      {/* Jumlah */}
      <TableCell className="py-3 text-right text-sm">{prescription.quantity}</TableCell>

      {/* Total */}
      <TableCell className="py-3 text-right text-sm font-medium">
        {formatCurrency(parseFloat(medicationPrice || "0") * prescription.quantity)}
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <div className="space-y-1">
          {prescription.isAdministered ? (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <IconCheck className="mr-1 h-3 w-3" />
              Diberikan
            </Badge>
          ) : (
            <Badge variant="secondary">
              <IconClock className="mr-1 h-3 w-3" />
              Belum
            </Badge>
          )}
          {prescription.isFulfilled && (
            <div>
              <Badge variant="outline" className="text-xs">
                Apotek ✓
              </Badge>
            </div>
          )}
        </div>
      </TableCell>

      {/* Waktu */}
      <TableCell className="text-muted-foreground py-3 text-xs whitespace-nowrap">
        {prescription.administeredAt
          ? formatDateTime(prescription.administeredAt)
          : formatDateTime(prescription.createdAt)}
      </TableCell>

      {/* Aksi */}
      <TableCell className="py-3">
        <div className="flex gap-1">
          {!prescription.isAdministered && isNurse && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdminister(prescription.id)}
              className="h-7 text-xs hover:bg-green-50 hover:text-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <>
                  <IconCheck className="mr-1 h-3 w-3" />
                  Berikan
                </>
              )}
            </Button>
          )}
          {!prescription.isAdministered && !isLocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteRequest(prescription.id)}
              className="hover:bg-destructive/10 hover:text-destructive h-7 w-7"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
})

export const PrescriptionsList = memo(function PrescriptionsList({
  prescriptions,
  onRefresh,
  isLocked = false,
}: PrescriptionsListProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const isNurse = session?.user?.role === "nurse"

  const subtotal = useMemo(() => {
    return prescriptions.reduce((total, prescription) => {
      const price = prescription.isCompound
        ? prescription.compoundRecipePrice
        : prescription.drugPrice
      if (price) {
        const quantity = prescription.dispensedQuantity || prescription.quantity
        return total + parseFloat(price) * quantity
      }
      return total
    }, 0)
  }, [prescriptions])

  const handleAdminister = async (prescriptionId: string) => {
    if (!session?.user.id) {
      toast.error("Tidak dapat menentukan user ID")
      return
    }
    setSelectedPrescriptionId(prescriptionId)
    setIsLoading(true)
    try {
      await administerPrescription({ prescriptionId, administeredBy: session.user.id })
      toast.success("Obat berhasil ditandai sebagai sudah diberikan")
      onRefresh?.()
    } catch (error) {
      console.error("Error administering prescription:", error)
      toast.error("Gagal menandai obat")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    try {
      await deleteInpatientPrescription(deleteId)
      toast.success("Resep berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast.error("Gagal menghapus resep")
    } finally {
      setIsLoading(false)
      setDeleteId(null)
    }
  }

  if (prescriptions.length === 0) return <EmptyState />

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold tracking-wider uppercase">Obat</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Dosis & Frekuensi
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                Jumlah
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                Total
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Waktu
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((prescription) => (
              <PrescriptionRow
                key={prescription.id}
                prescription={prescription}
                onAdminister={handleAdminister}
                onDeleteRequest={setDeleteId}
                isNurse={isNurse}
                isLoading={isLoading && selectedPrescriptionId === prescription.id}
                isLocked={isLocked}
              />
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total Biaya
              </TableCell>
              <TableCell className="text-right text-lg font-bold">
                {formatCurrency(subtotal)}
              </TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Resep Obat?</AlertDialogTitle>
            <AlertDialogDescription>
              Resep yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})
