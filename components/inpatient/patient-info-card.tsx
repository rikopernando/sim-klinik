import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PatientDetail } from "@/types/inpatient"
import { formatDate, getAgeDisplay } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"
import { cn } from "@/lib/utils"
import {
  LONG_STAY_WARNING_THRESHOLD,
  LONG_STAY_CRITICAL_THRESHOLD,
} from "@/lib/constants/inpatient"

const ROOM_TYPE_LABELS: Record<string, string> = {
  VIP: "VIP",
  "Class 1": "Kelas 1",
  "Class 2": "Kelas 2",
  "Class 3": "Kelas 3",
  ICU: "ICU",
  NICU: "NICU",
  Isolation: "Isolasi",
}

interface PatientInfoCardProps {
  data: PatientDetail
}

export function PatientInfoCard({ data }: PatientInfoCardProps) {
  const { patient, bedAssignment, daysInHospital, totalRoomCost } = data

  const isWarning =
    daysInHospital >= LONG_STAY_WARNING_THRESHOLD &&
    daysInHospital < LONG_STAY_CRITICAL_THRESHOLD
  const isCritical = daysInHospital >= LONG_STAY_CRITICAL_THRESHOLD

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Patient Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Pasien</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground shrink-0 text-sm">Nama</dt>
              <dd className="text-right text-sm font-medium">{patient.patientName}</dd>
            </div>

            {(patient.gender === "M" || patient.gender === "F") && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground shrink-0 text-sm">Kelamin</dt>
                <dd className="text-right text-sm font-medium">
                  {patient.gender === "M" ? "Laki-laki" : "Perempuan"}
                </dd>
              </div>
            )}

            {patient.dateOfBirth && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground shrink-0 text-sm">Tgl Lahir</dt>
                <dd className="text-right text-sm font-medium">
                  {formatDate(patient.dateOfBirth)} · {getAgeDisplay(patient.dateOfBirth)}
                </dd>
              </div>
            )}

            {patient.nik && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground shrink-0 text-sm">NIK</dt>
                <dd className="font-mono text-right text-sm font-medium">{patient.nik}</dd>
              </div>
            )}

            {patient.phone && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground shrink-0 text-sm">Telepon</dt>
                <dd className="text-right text-sm font-medium">{patient.phone}</dd>
              </div>
            )}

            {patient.address && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground shrink-0 text-sm">Alamat</dt>
                <dd className="text-right text-sm font-medium">{patient.address}</dd>
              </div>
            )}

            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground shrink-0 text-sm">Asuransi</dt>
              <dd className="text-right text-sm font-medium">{patient.insurance || "Umum"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Admission & Room Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Rawat Inap</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Row 1: location facts */}
          <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Tanggal Masuk
              </p>
              <p className="text-sm font-medium">
                {patient.admissionDate ? formatDate(patient.admissionDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Kamar & Bed
              </p>
              {bedAssignment ? (
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-semibold">
                    {bedAssignment.roomNumber}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    · Bed {bedAssignment.bedNumber}
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">—</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Tipe Ruangan
              </p>
              <p className="text-sm font-medium">
                {bedAssignment
                  ? (ROOM_TYPE_LABELS[bedAssignment.roomType] ?? bedAssignment.roomType)
                  : "—"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Row 2: clinical numbers */}
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Hari Rawat
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    isCritical
                      ? "text-destructive"
                      : isWarning
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-foreground"
                  )}
                >
                  {daysInHospital}
                </span>
                <span className="text-muted-foreground text-sm">hari</span>
              </div>
              {(isWarning || isCritical) && (
                <Badge
                  className={cn(
                    "mt-1 text-xs",
                    isCritical
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  )}
                >
                  Rawat Lama
                </Badge>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Tarif / Hari
              </p>
              <p className="text-sm font-medium">
                {bedAssignment ? formatCurrency(parseFloat(bedAssignment.dailyRate)) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Total Biaya
              </p>
              <p className="font-semibold">{formatCurrency(parseFloat(totalRoomCost))}</p>
              {bedAssignment && (
                <p className="text-muted-foreground text-xs">
                  {daysInHospital} hari × {formatCurrency(parseFloat(bedAssignment.dailyRate))}
                </p>
              )}
            </div>
          </div>

          {/* Catatan (optional) */}
          {bedAssignment?.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                Catatan
              </p>
              <p className="text-sm">{bedAssignment.notes}</p>
            </div>
          )}

          {!bedAssignment && (
            <p className="text-muted-foreground mt-4 border-t pt-4 text-center text-sm">
              Pasien belum ditempatkan di kamar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
