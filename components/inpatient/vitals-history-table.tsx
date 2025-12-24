/**
 * Vitals History Table Component
 * Displays history of vital signs recordings
 */

import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { VitalSigns } from "@/types/inpatient"

interface VitalsHistoryTableProps {
  vitals: VitalSigns[]
}

export function VitalsHistoryTable({ vitals }: VitalsHistoryTableProps) {
  if (vitals.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">Belum ada rekaman tanda vital</div>
    )
  }

  return (
    <div className="rounded-md border">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {vitals.map((vital) => (
            <TableRow key={vital.id}>
              <TableCell className="font-medium">
                {format(new Date(vital.recordedAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
              </TableCell>
              <TableCell>{vital.temperature ? `${vital.temperature}` : "-"}</TableCell>
              <TableCell>
                {vital.bloodPressureSystolic && vital.bloodPressureDiastolic
                  ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`
                  : "-"}
              </TableCell>
              <TableCell>{vital.pulse || "-"}</TableCell>
              <TableCell>{vital.respiratoryRate || "-"}</TableCell>
              <TableCell>
                {vital.oxygenSaturation ? (
                  <span
                    className={
                      parseFloat(vital.oxygenSaturation) < 95
                        ? "text-destructive font-semibold"
                        : ""
                    }
                  >
                    {vital.oxygenSaturation}%
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>
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
              <TableCell>
                {vital.weight && vital.height ? (
                  <div className="text-sm">
                    <div>
                      {vital.weight} kg / {vital.height} cm
                    </div>
                    {vital.bmi && <div className="text-muted-foreground">BMI: {vital.bmi}</div>}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{vital.recordedBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
