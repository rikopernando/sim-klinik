/**
 * Patients Table Component
 * Displays list of patients with loading and empty states
 */

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PatientsTableRow } from "./patients-table-row"

interface Patient {
  id: number
  mrNumber: string
  nik: string | null
  name: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  insuranceType: string | null
}

interface PatientsTableProps {
  patients: Patient[]
  onEditPatient: (patientId: number) => void
}

export function PatientsTable({ patients, onEditPatient }: PatientsTableProps) {
  if (patients.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">Tidak ada data pasien</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. RM</TableHead>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Jenis Kelamin</TableHead>
            <TableHead>Tanggal Lahir</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Jaminan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <PatientsTableRow key={patient.id} patient={patient} onEdit={onEditPatient} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
