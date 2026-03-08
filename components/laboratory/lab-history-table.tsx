/**
 * Lab History Table Component
 * Displays lab order history in table format
 */

"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IconFlask, IconEye } from "@tabler/icons-react"
import { formatCurrency } from "@/lib/utils/billing"
import type { LabOrderWithRelations } from "@/types/lab"

interface LabHistoryTableProps {
  data: LabOrderWithRelations[]
  isLoading: boolean
}

function LabHistoryTableComponent({ data, isLoading }: LabHistoryTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge variant="default">Terverifikasi</Badge>
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Selesai
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600">
            Dalam Proses
          </Badge>
        )
      case "specimen_collected":
        return (
          <Badge variant="outline" className="border-blue-600 text-blue-600">
            Spesimen Diambil
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
            Menunggu
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const getDepartmentBadge = (department: string | null | undefined) => {
    switch (department) {
      case "LAB":
        return (
          <Badge variant="secondary" className="text-xs">
            Laboratorium
          </Badge>
        )
      case "RAD":
        return (
          <Badge variant="default" className="text-xs">
            Radiologi
          </Badge>
        )
      case "EKG":
        return (
          <Badge variant="outline" className="text-xs">
            EKG
          </Badge>
        )
      default:
        return null
    }
  }

  const getUrgencyBadge = (urgency: string | null | undefined) => {
    if (!urgency || urgency === "routine") return null
    return (
      <Badge
        variant={urgency === "stat" ? "destructive" : "default"}
        className={urgency === "urgent" ? "bg-orange-500" : ""}
      >
        {urgency.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-muted-foreground">Tidak ada riwayat pemeriksaan ditemukan</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Order</TableHead>
          <TableHead>Pasien</TableHead>
          <TableHead>Pemeriksaan</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Biaya</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div className="font-mono text-sm">{order.orderNumber}</div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{order.patient.name}</div>
                <div className="text-muted-foreground text-xs">{order.patient.mrNumber}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.test?.name || "N/A"}</span>
                  {getDepartmentBadge(order.test?.department)}
                </div>
                <div className="flex items-center gap-1">{getUrgencyBadge(order.urgency)}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">
                  {format(new Date(order.orderedAt), "d MMM yyyy", { locale: idLocale })}
                </div>
                <div className="text-muted-foreground text-xs">
                  {format(new Date(order.orderedAt), "HH:mm", { locale: idLocale })}
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell className="text-right">
              <span className="font-medium">{formatCurrency(parseFloat(order.price))}</span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/medical-records/${order.visitId}`)}
              >
                <IconEye className="mr-1 h-4 w-4" />
                Lihat
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const LabHistoryTable = memo(LabHistoryTableComponent)
