import { memo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LONG_STAY_WARNING_THRESHOLD,
  LONG_STAY_CRITICAL_THRESHOLD,
} from "@/lib/constants/inpatient"
import { TableCell, TableRow } from "@/components/ui/table"
import type { InpatientPatient } from "@/types/inpatient"

interface PatientListRowProps {
  patient: InpatientPatient
  onClick: (visitId: string) => void
}

const ROOM_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  VIP: {
    label: "VIP",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  "Class 1": {
    label: "Kelas 1",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  "Class 2": {
    label: "Kelas 2",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  "Class 3": {
    label: "Kelas 3",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  ICU: {
    label: "ICU",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
  NICU: {
    label: "NICU",
    className: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  Isolation: {
    label: "Isolasi",
    className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
}

function PatientListRowComponent({ patient, onClick }: PatientListRowProps) {
  const days = patient.daysInHospital
  const isWarning = days >= LONG_STAY_WARNING_THRESHOLD && days < LONG_STAY_CRITICAL_THRESHOLD
  const isCritical = days >= LONG_STAY_CRITICAL_THRESHOLD

  const roomType = ROOM_TYPE_CONFIG[patient.roomType] ?? {
    label: patient.roomType,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <TableRow
      onClick={() => onClick(patient.visitId)}
      className="group cursor-pointer transition-colors"
    >
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
          <span className="text-muted-foreground text-xs">Bed {patient.bedNumber}</span>
        </div>
      </TableCell>
      <TableCell className="hidden py-3 sm:table-cell">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            roomType.className
          )}
        >
          {roomType.label}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground hidden py-3 text-sm md:table-cell">
        {patient.admissionDate
          ? format(new Date(patient.admissionDate), "dd MMM yyyy", { locale: localeId })
          : "—"}
      </TableCell>
      <TableCell className="py-2">
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            isCritical
              ? "text-destructive"
              : isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
          )}
        >
          {days} hari
        </span>
      </TableCell>
      <TableCell className="hidden py-3 sm:table-cell">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onClick(patient.visitId)
          }}
          className="h-7 shrink-0 px-2.5 text-xs"
        >
          Lihat Detail
        </Button>
      </TableCell>
    </TableRow>
  )
}

export const PatientListRow = memo(PatientListRowComponent)
