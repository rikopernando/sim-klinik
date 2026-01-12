/**
 * Vitals History Table Component
 * Displays history of vital signs recordings with delete functionality
 */

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VitalSigns } from "@/types/inpatient"
import { IconTrash, IconAlertCircle } from "@tabler/icons-react"
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
  getBMICategoryID,
} from "@/lib/inpatient/vitals-utils"
import { getErrorMessage } from "@/lib/utils/error"
import { formatDateTime } from "@/lib/utils/date"

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
    const recorded = new Date(recordedAt)
    const now = new Date()
    const timeDiff = now.getTime() - recorded.getTime()
    const oneHour = 3600000 // 1 hour in milliseconds
    return timeDiff <= oneHour
  }

  const handleDelete = async (vitalId: string) => {
    try {
      setDeletingId(vitalId)
      await deleteVitalSigns(vitalId)
      toast.success("Data tanda vital berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting vital signs:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  if (vitals.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">Belum ada rekaman tanda vital</div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Waktu Rekam</TableHead>
          <TableHead>Suhu (°C)</TableHead>
          <TableHead>Tekanan Darah</TableHead>
          <TableHead>Nadi (/mnt)</TableHead>
          <TableHead>RR (/mnt)</TableHead>
          <TableHead>SpO₂ (%)</TableHead>
          <TableHead>Kesadaran</TableHead>
          <TableHead>Skala Nyeri</TableHead>
          <TableHead>BB/TB</TableHead>
          <TableHead>Dicatat Oleh</TableHead>
          <TableHead className="text-center">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vitals.map((vital) => {
          const tempStatus = getTemperatureStatus(vital.temperature)
          const pulseStatus = getPulseStatus(vital.pulse)
          const spo2Status = getOxygenSaturationStatus(vital.oxygenSaturation)
          const bmiCategory = getBMICategoryID(vital.bmi)

          return (
            <TableRow key={vital.id}>
              <TableCell className="font-medium whitespace-nowrap">
                {formatDateTime(vital.recordedAt)}
              </TableCell>

              {/* Temperature with status highlighting */}
              <TableCell>
                {vital.temperature ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        tempStatus === "normal"
                          ? ""
                          : tempStatus === "high"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-blue-600"
                      }
                    >
                      {vital.temperature}
                    </span>
                    {tempStatus !== "normal" && (
                      <IconAlertCircle className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Blood Pressure */}
              <TableCell>
                {vital.bloodPressureSystolic && vital.bloodPressureDiastolic
                  ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`
                  : "-"}
              </TableCell>

              {/* Pulse with status highlighting */}
              <TableCell>
                {vital.pulse ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        pulseStatus === "normal"
                          ? ""
                          : pulseStatus === "high"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-blue-600"
                      }
                    >
                      {vital.pulse}
                    </span>
                    {pulseStatus !== "normal" && (
                      <IconAlertCircle className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Respiratory Rate */}
              <TableCell>{vital.respiratoryRate || "-"}</TableCell>

              {/* Oxygen Saturation with status highlighting */}
              <TableCell>
                {vital.oxygenSaturation ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        spo2Status === "normal"
                          ? ""
                          : spo2Status === "critical"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-yellow-600"
                      }
                    >
                      {vital.oxygenSaturation}%
                    </span>
                    {spo2Status !== "normal" && (
                      <IconAlertCircle
                        className={`h-3 w-3 ${spo2Status === "critical" ? "text-red-600" : "text-yellow-600"}`}
                      />
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Consciousness */}
              <TableCell>
                {vital.consciousness ? (
                  <Badge
                    variant={
                      vital.consciousness === "Alert"
                        ? "default"
                        : vital.consciousness === "Confused"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {vital.consciousness}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Pain Scale */}
              <TableCell>
                {vital.painScale !== null ? (
                  <Badge
                    variant={
                      vital.painScale <= 3
                        ? "default"
                        : vital.painScale <= 6
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {vital.painScale}/10
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Weight/Height/BMI */}
              <TableCell>
                {vital.weight && vital.height ? (
                  <div className="text-sm">
                    <div>
                      {vital.weight} kg / {vital.height} cm
                    </div>
                    {vital.bmi && (
                      <div className="text-muted-foreground text-xs">
                        BMI: {vital.bmi} ({bmiCategory})
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Recorded By */}
              <TableCell className="text-muted-foreground text-sm">{vital.recordedBy}</TableCell>

              {/* Delete Action */}
              <TableCell className="text-center">
                {canDelete(vital.recordedAt) && !isLocked && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={deletingId === vital.id}>
                        <IconTrash className="h-4 w-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Tanda Vital?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Data tanda vital yang dihapus tidak dapat dikembalikan. Tindakan ini hanya
                          dapat dilakukan dalam 1 jam setelah pencatatan.
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
  )
}
