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
  return (
    <TableRow>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{item.patient.name}</p>
          <p className="text-muted-foreground text-xs">MR: {item.patient.mrNumber}</p>
          <p className="text-muted-foreground text-xs">Kunjungan: {item.visit.visitNumber}</p>
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
          Proses Semua
        </Button>
      </TableCell>
    </TableRow>
  )
})
