/**
 * Prescription Queue Table Row Component (Grouped by Visit)
 * Displays compact summary with process button
 */

import { memo } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { PrescriptionQueueItem } from "@/types/pharmacy"

interface PrescriptionRowProps {
  item: PrescriptionQueueItem
  index: number
  onProcess: (item: PrescriptionQueueItem) => void
}

export const PrescriptionRow = memo(function PrescriptionRow({
  item,
  index,
  onProcess,
}: PrescriptionRowProps) {
  const isInpatient = item.visit.visitType === "inpatient"
  const visitTypeBadgeVariant =
    item.visit.visitType === "outpatient"
      ? "default"
      : item.visit.visitType === "inpatient"
        ? "secondary"
        : "destructive"

  return (
    <TableRow>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{item.patient.name}</p>
            <Badge variant={visitTypeBadgeVariant} className="text-xs">
              {item.visit.visitType === "outpatient"
                ? "Rawat Jalan"
                : item.visit.visitType === "inpatient"
                  ? "Rawat Inap"
                  : "UGD"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">MR: {item.patient.mrNumber}</p>
          <p className="text-muted-foreground text-xs">Kunjungan: {item.visit.visitNumber}</p>
          {/* Show room and bed info for inpatient */}
          {isInpatient && item.room && (
            <p className="text-muted-foreground text-xs">
              📍 {item.room.roomNumber} ({item.room.roomType})
              {item.bedAssignment && ` • Bed ${item.bedAssignment.bedNumber}`}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-medium">
          {item.prescriptions.length} Resep
        </Badge>
      </TableCell>
      <TableCell>
        <span className="whitespace-nowrap">{item.doctor?.name || "N/A"}</span>
      </TableCell>
      <TableCell>
        <Button size="sm" onClick={() => onProcess(item)}>
          Proses
        </Button>
      </TableCell>
    </TableRow>
  )
})
