import { memo } from "react"
import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { PrescriptionQueueItem } from "@/types/pharmacy"

interface PrescriptionRowProps {
  item: PrescriptionQueueItem
  index: number
  onProcess: (item: PrescriptionQueueItem) => void
}

const VISIT_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  outpatient: {
    label: "Rawat Jalan",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  inpatient: {
    label: "Rawat Inap",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  emergency: {
    label: "UGD",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

export const PrescriptionRow = memo(function PrescriptionRow({
  item,
  index,
  onProcess,
}: PrescriptionRowProps) {
  const visitBadge = VISIT_TYPE_BADGE[item.visit.visitType] ?? VISIT_TYPE_BADGE.outpatient
  const compoundCount = item.prescriptions.filter((p) => p.prescription.isCompound).length
  const drugCount = item.prescriptions.length - compoundCount

  const prescribedAt = item.prescriptions[0]?.prescription.createdAt
  const timeLabel = prescribedAt
    ? new Date(prescribedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "-"

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="text-muted-foreground pl-4 text-sm font-medium">{index + 1}</TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{item.patient.name}</p>
            <Badge variant="outline" className={`text-xs font-medium ${visitBadge.className}`}>
              {visitBadge.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">MR: {item.patient.mrNumber}</p>
          <p className="text-muted-foreground text-xs">{item.visit.visitNumber}</p>
          {item.visit.visitType === "inpatient" && item.room && (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.room.roomNumber} ({item.room.roomType})
              {item.bedAssignment && ` · Bed ${item.bedAssignment.bedNumber}`}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {drugCount > 0 && (
            <Badge variant="secondary" className="text-xs font-medium">
              {drugCount} Obat
            </Badge>
          )}
          {compoundCount > 0 && (
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-xs font-medium text-purple-700"
            >
              {compoundCount} Racik
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm whitespace-nowrap">{item.doctor?.name || "-"}</span>
      </TableCell>

      <TableCell>
        <span className="text-muted-foreground text-xs tabular-nums">{timeLabel}</span>
      </TableCell>

      <TableCell>
        <Button size="sm" onClick={() => onProcess(item)}>
          Proses
        </Button>
      </TableCell>
    </TableRow>
  )
})
