import { memo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { LONG_STAY_THRESHOLD } from "@/lib/constants/inpatient"
import { TableCell, TableRow } from "@/components/ui/table"
import type { InpatientPatient } from "@/types/inpatient"

interface PatientListRowProps {
  patient: InpatientPatient
  onClick: (visitId: string) => void
}

function PatientListRowComponent({ patient, onClick }: PatientListRowProps) {
  const isLongStay = patient.daysInHospital > LONG_STAY_THRESHOLD

  return (
    <TableRow onClick={() => onClick(patient.visitId)} className="cursor-pointer transition-colors">
      <TableCell className="py-3">
        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
          {patient.mrNumber}
        </span>
      </TableCell>
      <TableCell className="py-3 font-medium">{patient.patientName}</TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-1.5">
          <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
            {patient.roomNumber}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{patient.bedNumber}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">{patient.roomType}</TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">
        {patient.admissionDate
          ? format(new Date(patient.admissionDate), "dd MMM yyyy, HH:mm", { locale: localeId })
          : "—"}
      </TableCell>
      <TableCell className="py-3 text-right">
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            isLongStay ? "text-destructive" : "text-foreground"
          )}
        >
          {patient.daysInHospital} hari
        </span>
      </TableCell>
    </TableRow>
  )
}

export const PatientListRow = memo(PatientListRowComponent)
