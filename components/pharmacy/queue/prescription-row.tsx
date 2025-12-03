/**
 * Prescription Queue Table Row Component (Grouped by Visit)
 * Displays compact summary with process button
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { memo } from "react"

interface Drug {
  id: number
  name: string
  genericName?: string | null
  unit: string
  price: string
}

interface Patient {
  id: number
  name: string
  mrNumber: string
}

interface Doctor {
  id: string
  name: string
}

interface Visit {
  id: number
  visitNumber: string
}

interface Prescription {
  id: number
  dosage: string
  frequency: string
  quantity: number
  duration?: string | null
  instructions?: string | null
}

interface GroupedQueueItem {
  visit: Visit
  patient: Patient
  doctor: Doctor | null
  prescriptions: Array<{
    prescription: Prescription
    drug: Drug
  }>
}

interface PrescriptionRowProps {
  item: GroupedQueueItem
  index: number
  onProcess: (item: GroupedQueueItem) => void
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
      <TableCell className="text-right">
        <Button size="sm" onClick={() => onProcess(item)}>
          Proses Semua
        </Button>
      </TableCell>
    </TableRow>
  )
})
