/**
 * Visit History Table Component
 * Displays list of visits with related data
 */

import { memo } from "react"
import { useRouter } from "next/navigation"
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
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { VisitHistoryItem } from "@/types/visit-history"
import { VISIT_STATUS_INFO, type VisitStatus } from "@/types/visit-status"
import Loader from "@/components/loader"
import { cn } from "@/lib/utils"

interface VisitHistoryTableProps {
  visits: VisitHistoryItem[]
  isLoading: boolean
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

function VisitHistoryTableComponent({ visits, isLoading }: VisitHistoryTableProps) {
  const router = useRouter()

  const handleViewDetail = (visitId: string, visitType: string) => {
    switch (visitType) {
      case "emergency":
        router.push(`/dashboard/emergency/${visitId}`)
        break
      case "inpatient":
        router.push(`/dashboard/inpatient/patients/${visitId}`)
        break
      case "outpatient":
      default:
        router.push(`/dashboard/medical-records/${visitId}`)
        break
    }
  }

  if (isLoading) {
    return <Loader message="Memuat riwayat kunjungan..." />
  }

  if (visits.length === 0) {
    return (
      <div className="border-border flex h-64 items-center justify-center rounded-md border">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Tidak ada data kunjungan</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Kunjungan</TableHead>
          <TableHead>Pasien</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Poli/Unit</TableHead>
          <TableHead>Dokter</TableHead>
          <TableHead>Tanggal Kunjungan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((item) => {
          const statusInfo = VISIT_STATUS_INFO[item.visit.status as VisitStatus]
          return (
            <TableRow key={item.visit.id}>
              <TableCell className="font-medium">{item.visit.visitNumber}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.patient.name}</div>
                  <div className="text-muted-foreground text-sm">{item.patient.mrNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {VISIT_TYPE_LABELS[item.visit.visitType] || item.visit.visitType}
                </Badge>
              </TableCell>
              <TableCell>{item.poli?.name || "-"}</TableCell>
              <TableCell>{item.doctor?.name || "-"}</TableCell>
              <TableCell>
                {format(new Date(item.visit.arrivalTime), "dd MMM yyyy, HH:mm", { locale: id })}
              </TableCell>
              <TableCell>
                <Badge className={cn(statusInfo?.bgColor, statusInfo?.color, "border-0")}>
                  {statusInfo?.label || item.visit.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetail(item.visit.id, item.visit.visitType)}
                  title="Lihat Detail"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export const VisitHistoryTable = memo(VisitHistoryTableComponent)
