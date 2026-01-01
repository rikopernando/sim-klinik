/**
 * Procedures List Component
 * Displays inpatient procedures with status tracking
 */

"use client"

import { memo, useState } from "react"
import { IconStethoscope, IconTrash, IconCheck, IconLoader, IconClock } from "@tabler/icons-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { formatDateTime } from "@/lib/utils/date"
import { useSession } from "@/lib/auth-client"
import { InpatientProcedure, PROCEDURE_STATUS, ProcedureStatus } from "@/types/inpatient"
import { updateProcedureStatus, deleteInpatientProcedure } from "@/lib/services/inpatient.service"

interface ProceduresListProps {
  procedures: InpatientProcedure[]
  onRefresh?: () => void
}

// Status badge configuration
const STATUS_CONFIG = {
  ordered: { label: "Dipesan", variant: "secondary" as const, icon: IconClock },
  in_progress: { label: "Sedang Berlangsung", variant: "default" as const, icon: IconLoader },
  completed: {
    label: "Selesai",
    variant: "default" as const,
    icon: IconCheck,
    className: "bg-green-600",
  },
  cancelled: { label: "Dibatalkan", variant: "destructive" as const, icon: IconTrash },
}

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-muted-foreground py-8 text-center">
      <IconStethoscope className="mx-auto mb-2 h-12 w-12 opacity-20" />
      <p>Belum ada tindakan</p>
    </div>
  )
})

// Memoized table row component
const ProcedureRow = memo(function ProcedureRow({
  procedure,
  onStatusChange,
  onDelete,
  isLoading,
  canChangeStatus,
}: {
  isLoading: boolean
  procedure: InpatientProcedure
  onStatusChange: (id: string, status: ProcedureStatus) => void
  onDelete: (id: string) => void
  canChangeStatus: boolean
}) {
  const statusConfig = STATUS_CONFIG[procedure.status]
  const StatusIcon = statusConfig.icon

  return (
    <TableRow>
      <TableCell className="font-medium">{procedure.serviceName}</TableCell>
      <TableCell>
        {procedure.scheduledAt ? (
          <div className="text-sm">{formatDateTime(procedure.scheduledAt)}</div>
        ) : (
          <span className="text-muted-foreground text-sm">Belum dijadwalkan</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {procedure.orderedByName || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {procedure.performedByName || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {procedure.performedAt ? formatDateTime(procedure.performedAt) : "-"}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
        {procedure.notes || "-"}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {canChangeStatus &&
            procedure.status !== PROCEDURE_STATUS.COMPLETED &&
            procedure.status !== PROCEDURE_STATUS.CANCELLED && (
              <Select
                value={procedure.status}
                onValueChange={(value) => onStatusChange(procedure.id, value as ProcedureStatus)}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PROCEDURE_STATUS.ORDERED}>Dipesan</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.IN_PROGRESS}>Sedang Berlangsung</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.COMPLETED}>Selesai</SelectItem>
                  <SelectItem value={PROCEDURE_STATUS.CANCELLED}>Batalkan</SelectItem>
                </SelectContent>
              </Select>
            )}
          {procedure.status === "ordered" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(procedure.id)}
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
              disabled={isLoading}
              title="Hapus tindakan"
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : <IconTrash className="h-4 w-4" />}
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
}: ProceduresListProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState("")
  const isDoctor = session?.user?.role === "doctor"
  const isNurse = session?.user?.role === "nurse"
  const canChangeStatus = isDoctor || isNurse

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

  const handleDelete = async (procedureId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tindakan ini?")) {
      return
    }

    setIsLoading(true)
    setSelectedRowId(procedureId)
    try {
      await deleteInpatientProcedure(procedureId)
      toast.success("Tindakan berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting procedure:", error)
      toast.error("Gagal menghapus tindakan")
    } finally {
      setIsLoading(false)
    }
  }

  if (procedures.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Tindakan</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dipesan Oleh</TableHead>
            <TableHead>Dikerjakan Oleh</TableHead>
            <TableHead>Waktu Pengerjaan</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedures.map((procedure) => (
            <ProcedureRow
              key={procedure.id}
              procedure={procedure}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              canChangeStatus={canChangeStatus}
              isLoading={isLoading && selectedRowId === procedure.id}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})
