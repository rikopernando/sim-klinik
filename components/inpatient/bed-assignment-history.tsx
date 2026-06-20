"use client"

import { IconBed } from "@tabler/icons-react"
import { usePermission } from "@/hooks/use-permission"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransferBedDialog } from "@/components/inpatient/transfer-bed-dialog"
import type { BedAssignmentHistoryItem } from "@/types/inpatient"
import { formatDate } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"

const ROOM_TYPE_LABELS: Record<string, string> = {
  VIP: "VIP",
  "Class 1": "Kelas 1",
  "Class 2": "Kelas 2",
  "Class 3": "Kelas 3",
  ICU: "ICU",
  NICU: "NICU",
  Isolation: "Isolasi",
}

interface BedAssignmentHistoryProps {
  history: BedAssignmentHistoryItem[]
  visitId: string
  patientName: string
  currentRoomNumber?: string
  currentBedNumber?: string
  onSuccess?: () => void
}

export function BedAssignmentHistory({
  history,
  visitId,
  patientName,
  currentRoomNumber,
  currentBedNumber,
  onSuccess,
}: BedAssignmentHistoryProps) {
  const { hasPermission } = usePermission()

  const totalCost = history.reduce((sum, item) => sum + parseFloat(item.totalCost), 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Riwayat Bed</CardTitle>
            <CardDescription>
              {history.length === 0
                ? "Belum ada riwayat penempatan"
                : `${history.length} riwayat penempatan`}
            </CardDescription>
          </div>
          <div className="flex items-start gap-4">
            {history.length > 0 && (
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Total Biaya Kamar</p>
                <p className="text-base font-bold">{formatCurrency(totalCost)}</p>
              </div>
            )}
            {hasPermission("inpatient:manage_beds") && currentRoomNumber && (
              <TransferBedDialog
                visitId={visitId}
                patientName={patientName}
                currentRoomNumber={currentRoomNumber}
                currentBedNumber={currentBedNumber}
                onSuccess={onSuccess}
              />
            )}
          </div>
        </div>
      </CardHeader>

      {history.length === 0 ? (
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <IconBed className="text-muted-foreground/30 mb-3 h-10 w-10" />
            <p className="text-muted-foreground text-sm">Belum ada riwayat penempatan bed</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-6 text-xs font-semibold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Kamar / Bed
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Tipe
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Masuk
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Keluar
                </TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                  Hari
                </TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                  Total
                </TableHead>
                <TableHead className="pr-6 text-xs font-semibold tracking-wider uppercase">
                  Oleh
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const isActive = !item.dischargedAt
                return (
                  <TableRow key={item.id}>
                    <TableCell className="py-3 pl-6">
                      {isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Selesai</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                          {item.roomNumber}
                        </span>
                        <span className="text-muted-foreground text-xs">Bed {item.bedNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      {ROOM_TYPE_LABELS[item.roomType] ?? item.roomType}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm whitespace-nowrap">
                      {formatDate(item.assignedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm whitespace-nowrap">
                      {item.dischargedAt ? formatDate(item.dischargedAt) : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-sm font-semibold">
                      {item.days}
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm font-medium">
                      {formatCurrency(parseFloat(item.totalCost))}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 pr-6 text-sm">
                      {item.assignedByName ?? "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}
