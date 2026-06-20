"use client"

import { memo, useMemo, useState } from "react"
import { IconStethoscope, IconTrash, IconCheck, IconLoader, IconClock } from "@tabler/icons-react"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { formatDateTime } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"
import { useSession } from "@/lib/auth-client"
import { InpatientProcedure, PROCEDURE_STATUS, ProcedureStatus } from "@/types/inpatient"
import { updateProcedureStatus, deleteInpatientProcedure } from "@/lib/services/inpatient.service"

interface ProceduresListProps {
  procedures: InpatientProcedure[]
  onRefresh?: () => void
  isLocked?: boolean
}

const STATUS_CONFIG = {
  ordered: { label: "Dipesan", variant: "secondary" as const, icon: IconClock },
  in_progress: { label: "Berlangsung", variant: "default" as const, icon: IconLoader },
  completed: {
    label: "Selesai",
    variant: "default" as const,
    icon: IconCheck,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  cancelled: { label: "Dibatalkan", variant: "destructive" as const, icon: IconTrash },
}

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <IconStethoscope className="text-muted-foreground/30 mb-3 h-10 w-10" />
      <p className="text-muted-foreground text-sm">Belum ada tindakan medis</p>
    </div>
  )
})

const ProcedureRow = memo(function ProcedureRow({
  procedure,
  onStatusChange,
  onDeleteRequest,
  isLoading,
  canChangeStatus,
  isLocked,
}: {
  isLoading: boolean
  procedure: InpatientProcedure
  onStatusChange: (id: string, status: ProcedureStatus) => void
  onDeleteRequest: (id: string) => void
  canChangeStatus: boolean
  isLocked: boolean
}) {
  const statusConfig = STATUS_CONFIG[procedure.status]
  const StatusIcon = statusConfig.icon

  return (
    <TableRow>
      {/* Nama Tindakan */}
      <TableCell className="py-3">
        <div className="text-sm font-medium">{procedure.serviceName}</div>
        {procedure.notes && (
          <div className="text-muted-foreground mt-0.5 max-w-xs truncate text-xs">
            {procedure.notes}
          </div>
        )}
      </TableCell>

      {/* Jadwal */}
      <TableCell className="text-muted-foreground py-3 text-sm whitespace-nowrap">
        {procedure.scheduledAt ? formatDateTime(procedure.scheduledAt) : "—"}
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <Badge
          variant={statusConfig.variant}
          className={"className" in statusConfig ? statusConfig.className : undefined}
        >
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </TableCell>

      {/* Harga */}
      <TableCell className="py-3 text-right text-sm font-medium">
        {formatCurrency(parseFloat(procedure.servicePrice || "0"))}
      </TableCell>

      {/* Personel */}
      <TableCell className="py-3">
        {procedure.orderedByName && (
          <div className="text-muted-foreground text-xs">Pesan: {procedure.orderedByName}</div>
        )}
        {procedure.performedByName && (
          <div className="text-muted-foreground text-xs">Kerjakan: {procedure.performedByName}</div>
        )}
        {!procedure.orderedByName && !procedure.performedByName && (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Aksi */}
      <TableCell className="py-3">
        <div className="flex gap-1">
          {canChangeStatus &&
            procedure.status !== PROCEDURE_STATUS.COMPLETED &&
            procedure.status !== PROCEDURE_STATUS.CANCELLED && (
              <Select
                value={procedure.status}
                onValueChange={(value) => onStatusChange(procedure.id, value as ProcedureStatus)}
              >
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PROCEDURE_STATUS.ORDERED}>Dipesan</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.IN_PROGRESS}>Berlangsung</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.COMPLETED}>Selesai</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.CANCELLED}>Batalkan</SelectItem>
                </SelectContent>
              </Select>
            )}
          {procedure.status === "ordered" && !isLocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteRequest(procedure.id)}
              className="hover:bg-destructive/10 hover:text-destructive h-7 w-7"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <IconTrash className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
})

export const ProceduresList = memo(function ProceduresList({
  procedures,
  onRefresh,
  isLocked = false,
}: ProceduresListProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const isDoctor = session?.user?.role === "doctor"
  const isNurse = session?.user?.role === "nurse"
  const canChangeStatus = isDoctor || isNurse

  const subtotal = useMemo(() => {
    return procedures.reduce((total, procedure) => {
      return total + parseFloat(procedure.servicePrice || "0")
    }, 0)
  }, [procedures])

  const handleStatusChange = async (procedureId: string, status: ProcedureStatus) => {
    if (!session?.user.id) {
      toast.error("Tidak dapat menentukan user ID")
      return
    }
    setIsLoading(true)
    setSelectedRowId(procedureId)
    try {
      await updateProcedureStatus({
        status,
        procedureId,
        performedBy: status === PROCEDURE_STATUS.COMPLETED ? session.user.id : undefined,
      })
      toast.success("Status tindakan berhasil diperbarui")
      onRefresh?.()
    } catch (error) {
      console.error("Error updating procedure status:", error)
      toast.error("Gagal memperbarui status tindakan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    setSelectedRowId(deleteId)
    try {
      await deleteInpatientProcedure(deleteId)
      toast.success("Tindakan berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting procedure:", error)
      toast.error("Gagal menghapus tindakan")
    } finally {
      setIsLoading(false)
      setDeleteId(null)
    }
  }

  if (procedures.length === 0) return <EmptyState />

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Tindakan
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Jadwal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                Harga
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Personel
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.map((procedure) => (
              <ProcedureRow
                key={procedure.id}
                procedure={procedure}
                onStatusChange={handleStatusChange}
                onDeleteRequest={setDeleteId}
                canChangeStatus={canChangeStatus}
                isLoading={isLoading && selectedRowId === procedure.id}
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
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tindakan Medis?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan yang dihapus tidak dapat dikembalikan.
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
