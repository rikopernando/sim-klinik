"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InpatientPatient } from "@/types/inpatient"
import { PatientListRow } from "@/components/inpatient/patient-list-row"

interface PatientListTableProps {
  patients: InpatientPatient[]
}

function PatientListTableComponent({ patients }: PatientListTableProps) {
  const router = useRouter()

  const handleRowClick = (visitId: string) => {
    router.push(`/dashboard/inpatient/patients/${visitId}`)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="text-xs font-semibold tracking-wider uppercase">No. RM</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Nama Pasien
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Kamar / Bed
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Tipe</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Tanggal Masuk
          </TableHead>
          <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
            Hari Rawat
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <PatientListRow key={patient.visitId} patient={patient} onClick={handleRowClick} />
        ))}
      </TableBody>
    </Table>
  )
}

export const PatientListTable = memo(PatientListTableComponent)
