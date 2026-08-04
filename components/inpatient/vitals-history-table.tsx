"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { VitalSigns } from "@/types/inpatient"
import { IconTrash, IconAlertCircle, IconHeartRateMonitor } from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteVitalSigns } from "@/lib/services/inpatient.service"
import {
  getTemperatureStatus,
  getPulseStatus,
  getOxygenSaturationStatus,
} from "@/lib/inpatient/vitals-utils"
import { getErrorMessage } from "@/lib/utils/error"
import { formatDateTime } from "@/lib/utils/date"
import { cn } from "@/lib/utils"

interface VitalsHistoryTableProps {
  vitals: VitalSigns[]
  onRefresh?: () => void
  isLocked?: boolean
}

export function VitalsHistoryTable({
  vitals,
  onRefresh,
  isLocked = false,
}: VitalsHistoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canDelete = (recordedAt: string) => {
    const timeDiff = Date.now() - new Date(recordedAt).getTime()
    return timeDiff <= 3_600_000 // 1 hour
  }

  const handleDelete = async (vitalId: string) => {
    try {
      setDeletingId(vitalId)
      await deleteVitalSigns(vitalId)
      toast.success("Data tanda vital berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  if (vitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <IconHeartRateMonitor className="text-muted-foreground/30 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Belum ada rekaman tanda vital</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Waktu / Oleh
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Suhu (°C)
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Tekanan Darah
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Nadi (/mnt)
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              RR (/mnt)
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              SpO₂ (%)
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Skala Nyeri
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vitals.map((vital) => {
            const tempStatus = getTemperatureStatus(vital.temperature)
            const pulseStatus = getPulseStatus(vital.pulse)
            const spo2Status = getOxygenSaturationStatus(vital.oxygenSaturation)

            return (
              <TableRow key={vital.id}>
                {/* Waktu + Dicatat Oleh */}
                <TableCell className="py-3">
                  <div className="text-sm font-medium whitespace-nowrap">
                    {formatDateTime(vital.recordedAt)}
                  </div>
                  <div className="text-muted-foreground text-xs">{vital.recordedBy}</div>
                </TableCell>

                {/* Suhu */}
                <TableCell className="py-3">
                  {vital.temperature ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "text-sm",
                          tempStatus === "high" && "font-semibold text-red-600",
                          tempStatus === "low" && "font-semibold text-blue-600"
                        )}
                      >
                        {vital.temperature}
                      </span>
                      {tempStatus !== "normal" && (
                        <IconAlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Tekanan Darah */}
                <TableCell className="py-3 text-sm">
                  {vital.bloodPressureSystolic && vital.bloodPressureDiastolic ? (
                    `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Nadi */}
                <TableCell className="py-3">
                  {vital.pulse ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "text-sm",
                          pulseStatus === "high" && "font-semibold text-red-600",
                          pulseStatus === "low" && "font-semibold text-blue-600"
                        )}
                      >
                        {vital.pulse}
                      </span>
                      {pulseStatus !== "normal" && (
                        <IconAlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* RR */}
                <TableCell className="py-3 text-sm">
                  {vital.respiratoryRate ?? <span className="text-muted-foreground">—</span>}
                </TableCell>

                {/* SpO₂ */}
                <TableCell className="py-3">
                  {vital.oxygenSaturation ? (
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          "text-sm",
                          spo2Status === "critical" && "font-semibold text-red-600",
                          spo2Status === "low" && "font-semibold text-yellow-600"
                        )}
                      >
                        {vital.oxygenSaturation}%
                      </span>
                      {spo2Status !== "normal" && (
                        <IconAlertCircle
                          className={cn(
                            "h-3 w-3",
                            spo2Status === "critical" ? "text-red-500" : "text-yellow-500"
                          )}
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Skala Nyeri */}
                <TableCell className="py-3">
                  {vital.painScale !== null ? (
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold",
                        vital.painScale >= 7
                          ? "text-destructive"
                          : vital.painScale >= 4
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                      )}
                    >
                      {vital.painScale}/10
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Delete */}
                <TableCell className="py-3">
                  {canDelete(vital.recordedAt) && !isLocked && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          disabled={deletingId === vital.id}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Tanda Vital?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Data tanda vital yang dihapus tidak dapat dikembalikan. Tindakan ini
                            hanya dapat dilakukan dalam 1 jam setelah pencatatan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(vital.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
