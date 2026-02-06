/**
 * Medical Record History List Table Component
 * Displays list of medical records with related data
 */

import { memo } from "react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Lock, Unlock } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { MedicalRecordHistoryListItem } from "@/types/medical-record"
import Loader from "@/components/loader"

interface HistoryListTableProps {
  records: MedicalRecordHistoryListItem[]
  isLoading: boolean
  onViewDetail: (patientId: string) => void
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

function HistoryListTableComponent({ records, isLoading, onViewDetail }: HistoryListTableProps) {
  if (isLoading) {
    return <Loader message="Memuat riwayat rekam medis..." />
  }

  if (records.length === 0) {
    return (
      <div className="border-border flex h-64 items-center justify-center rounded-md border">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Tidak ada data rekam medis</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pasien</TableHead>
          <TableHead>No. Kunjungan</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Tanggal Rekam</TableHead>
          <TableHead className="text-center">Diagnosis</TableHead>
          <TableHead className="text-center">Prosedur</TableHead>
          <TableHead className="text-center">Resep</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <div className="font-medium">{item.patient.name}</div>
                <div className="text-muted-foreground text-sm">{item.patient.mrNumber}</div>
              </div>
            </TableCell>
            <TableCell className="font-medium">{item.visitNumber}</TableCell>
            <TableCell>
              <Badge variant="outline">{VISIT_TYPE_LABELS[item.visitType] || item.visitType}</Badge>
            </TableCell>
            <TableCell>
              {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
            </TableCell>
            <TableCell className="text-center">{item.diagnosisCount}</TableCell>
            <TableCell className="text-center">{item.procedureCount}</TableCell>
            <TableCell className="text-center">{item.prescriptionCount}</TableCell>
            <TableCell>
              {item.isLocked ? (
                <Badge className="border-0 bg-green-100 text-green-700">
                  <Lock className="mr-1 h-3 w-3" />
                  Terkunci
                </Badge>
              ) : item.isDraft ? (
                <Badge className="border-0 bg-yellow-100 text-yellow-700">Draft</Badge>
              ) : (
                <Badge className="border-0 bg-blue-100 text-blue-700">
                  <Unlock className="mr-1 h-3 w-3" />
                  Belum Terkunci
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(item.patient.id)}
                title="Lihat Riwayat Pasien"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const HistoryListTable = memo(HistoryListTableComponent)
