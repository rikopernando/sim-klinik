import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PatientsTableRow } from "./patients-table-row"

interface Patient {
  id: string
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
  onEditPatient: (patientId: string) => void
}

export function PatientsTable({ patients, onEditPatient }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="text-xs font-semibold tracking-wider uppercase">No. RM</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">NIK</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Jenis Kelamin
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">
            Tanggal Lahir
          </TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Telepon</TableHead>
          <TableHead className="text-xs font-semibold tracking-wider uppercase">Jaminan</TableHead>
          <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
            Aksi
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <PatientsTableRow key={patient.id} patient={patient} onEdit={onEditPatient} />
        ))}
      </TableBody>
    </Table>
  )
}
