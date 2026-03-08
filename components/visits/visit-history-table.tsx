/**
 * Visit History Table Component
 * Displays list of visits with related data
 */

import { memo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
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
import type { VisitHistoryItem } from "@/types/visit-history"
import { VISIT_STATUS_INFO, type VisitStatus } from "@/types/visit-status"
import Loader from "@/components/loader"
import { cn } from "@/lib/utils"
import { updateVisitStatus } from "@/lib/services/visit.service"
import { getErrorMessage } from "@/lib/utils/error"

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
  const [isUpdatingVisitStatus, setUpdatingVisitStatus] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)

  const handleViewDetailInpatient = (item: VisitHistoryItem) => {
    if (item.visit.status === "registered") {
      const paramsObj = {
        mrNumber: item?.patient?.mrNumber || "",
        visitNumber: item?.visit.visitNumber || "",
        assignBed: item.visit.id || "",
        patientName: item?.patient?.name || "",
      }

      const queryString = new URLSearchParams(paramsObj).toString()

      router.push(`/dashboard/inpatient/rooms?${queryString}`)
    } else {
      router.push(`/dashboard/inpatient/patients/${item.visit.id}`)
    }
  }

  const handleViewDetail = async (item: VisitHistoryItem) => {
    try {
      setSelectedVisitId(item.visit.id)
      if (item.visit.status === "registered" && item.visit.visitType !== "inpatient") {
        setUpdatingVisitStatus(true)
        await updateVisitStatus(item.visit.id, "in_examination")
      }

      switch (item.visit.visitType) {
        case "emergency":
          router.push(`/dashboard/emergency/${item.visit.id}`)
          break
        case "inpatient":
          handleViewDetailInpatient(item)
          break
        case "outpatient":
        default:
          router.push(`/dashboard/medical-records/${item.visit.id}`)
          break
      }
    } catch (error) {
      console.error("Failed to start examination:", error)
      toast.error(`Gagal memulai pemeriksaan: ${getErrorMessage(error)}`)
    } finally {
      setUpdatingVisitStatus(false)
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
                  onClick={() => handleViewDetail(item)}
                  title="Lihat Detail"
                >
                  {selectedVisitId === item.visit.id && isUpdatingVisitStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
