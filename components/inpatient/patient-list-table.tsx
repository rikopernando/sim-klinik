/**
 * Inpatient Patient List Table Component
 * Displays list of active inpatient patients
 */

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InpatientPatient } from "@/types/inpatient"
import { PatientListRow } from "@/components/inpatient/patient-list-row"
import Loader from "@/components/loader"

interface PatientListTableProps {
  patients: InpatientPatient[]
  isLoading: boolean
}

function PatientListTableComponent({ patients, isLoading }: PatientListTableProps) {
  const router = useRouter()

  const handleRowClick = (visitId: string) => {
    router.push(`/dashboard/inpatient/patients/${visitId}`)
  }

  if (isLoading) {
    return <Loader message="Memuat data pasien..." />
  }

  if (patients.length === 0) {
    return (
      <div className="border-border flex h-64 items-center justify-center rounded-md border">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Tidak ada pasien rawat inap aktif</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. RM</TableHead>
          <TableHead>Nama Pasien</TableHead>
          <TableHead>Kamar</TableHead>
          <TableHead>Bed</TableHead>
          <TableHead>Tipe Kamar</TableHead>
          <TableHead>Tanggal Masuk</TableHead>
          <TableHead className="text-right">Hari Rawat</TableHead>
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
