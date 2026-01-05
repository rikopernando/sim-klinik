/**
 * Prescriptions List Component
 * Displays inpatient prescriptions with administration tracking
 */

"use client"

import { memo, useState } from "react"
import { IconPill, IconTrash, IconCheck, IconClock } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InpatientPrescription } from "@/types/inpatient"
import { formatDateTime } from "@/lib/utils/date"
import {
  administerPrescription,
  deleteInpatientPrescription,
} from "@/lib/services/inpatient.service"
import { useSession } from "@/lib/auth-client"
import { Spinner } from "../ui/spinner"

interface PrescriptionsListProps {
  prescriptions: InpatientPrescription[]
  onRefresh?: () => void
  isLocked?: boolean
}

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-muted-foreground py-8 text-center">
      <IconPill className="mx-auto mb-2 h-12 w-12 opacity-20" />
      <p>Belum ada resep obat</p>
    </div>
  )
})

// Memoized table row component
const PrescriptionRow = memo(function PrescriptionRow({
  prescription,
  onAdminister,
  onDelete,
  isNurse,
  isLoading,
  isLocked,
}: {
  prescription: InpatientPrescription
  onAdminister: (id: string) => void
  onDelete: (id: string) => void
  isNurse: boolean
  isLoading: boolean
  isLocked: boolean
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{prescription.drugName || "-"}</TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{prescription.dosage}</div>
          <div className="text-muted-foreground">{prescription.frequency}</div>
        </div>
      </TableCell>
      <TableCell>{prescription.route || "-"}</TableCell>
      <TableCell className="text-right">{prescription.quantity}</TableCell>
      <TableCell>
        {prescription.isRecurring ? (
          <Badge variant="default">Rutin</Badge>
        ) : (
          <Badge variant="secondary">Sekali</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {prescription.isAdministered ? (
            <Badge variant="default">
              <IconCheck className="mr-1 h-3 w-3" />
              Sudah Diberikan
            </Badge>
          ) : (
            <Badge variant="secondary">
              <IconClock className="mr-1 h-3 w-3" />
              Belum Diberikan
            </Badge>
          )}
          {prescription.isFulfilled && (
            <Badge variant="outline" className="ml-1">
              Sudah Diserahkan Apotek
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {prescription.administeredAt
          ? formatDateTime(prescription.administeredAt)
          : formatDateTime(prescription.createdAt)}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
        {prescription.instructions || prescription.notes || "-"}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {!prescription.isAdministered && isNurse && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdminister(prescription.id)}
              className="h-8 hover:bg-green-100 hover:text-green-700"
              title="Tandai sudah diberikan"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-1 h-4 w-4" />
                  Loading...
                </>
              ) : (
                <>
                  <IconCheck className="mr-1 h-4 w-4" />
                  Berikan
                </>
              )}
            </Button>
          )}
          {!prescription.isAdministered && !isLocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(prescription.id)}
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
              title="Hapus resep"
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : <IconTrash className="h-4 w-4" />}
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
  const isNurse = session?.user?.role === "nurse"
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("")

  const handleAdminister = async (prescriptionId: string) => {
    if (!session?.user.id) {
      toast.error("Tidak dapat menentukan user ID")
      return
    }

    setSelectedPrescriptionId(prescriptionId)
    setIsLoading(true)
    try {
      await administerPrescription({
        prescriptionId,
        administeredBy: session.user.id,
      })
      toast.success("Obat berhasil ditandai sebagai sudah diberikan")
      onRefresh?.()
    } catch (error) {
      console.error("Error administering prescription:", error)
      toast.error("Gagal menandai obat")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus resep ini?")) {
      return
    }

    setIsLoading(true)
    setSelectedPrescriptionId(prescriptionId)
    try {
      await deleteInpatientPrescription(prescriptionId)
      toast.success("Resep berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast.error("Gagal menghapus resep")
    } finally {
      setIsLoading(false)
    }
  }

  if (prescriptions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Obat</TableHead>
            <TableHead>Dosis & Frekuensi</TableHead>
            <TableHead>Rute</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Instruksi/Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((prescription) => (
            <PrescriptionRow
              key={prescription.id}
              prescription={prescription}
              onAdminister={handleAdminister}
              onDelete={handleDelete}
              isNurse={isNurse}
              isLoading={isLoading && selectedPrescriptionId === prescription.id}
              isLocked={isLocked}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})
