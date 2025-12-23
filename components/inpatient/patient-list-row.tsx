/**
 * Inpatient Patient List Row Component
 * Single row in the patient list table
 */

import { memo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import { LONG_STAY_THRESHOLD } from "@/lib/constants/inpatient"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { InpatientPatient } from "@/types/inpatient"

interface PatientListRowProps {
  patient: InpatientPatient
  onClick: (visitId: string) => void
}

function PatientListRowComponent({ patient, onClick }: PatientListRowProps) {
  return (
    <TableRow onClick={() => onClick(patient.visitId)} className="hover:bg-muted/50 cursor-pointer">
      <TableCell className="font-medium">{patient.mrNumber}</TableCell>
      <TableCell>{patient.patientName}</TableCell>
      <TableCell>
        <Badge variant="outline">{patient.roomNumber}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{patient.bedNumber}</Badge>
      </TableCell>
      <TableCell>{patient.roomType}</TableCell>
      <TableCell>
        {patient.admissionDate
          ? format(new Date(patient.admissionDate), "dd MMM yyyy, HH:mm", {
              locale: localeId,
            })
          : "-"}
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={patient.daysInHospital > LONG_STAY_THRESHOLD ? "destructive" : "default"}>
          {patient.daysInHospital} hari
        </Badge>
      </TableCell>
    </TableRow>
  )
}

export const PatientListRow = memo(PatientListRowComponent)
