/**
 * Patient Info Card Component
 * Displays patient demographic and admission information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PatientDetail } from "@/types/inpatient"
import {
  IconUser,
  IconCalendar,
  IconMapPin,
  IconPhone,
  IconGenderMale,
  IconGenderFemale,
  IconBed,
  IconCurrencyDollar,
  IconCalendarEvent,
} from "@tabler/icons-react"
import { formatDate, formatDateTime, getAgeDisplay } from "@/lib/utils/date"
import { formatCurrency } from "@/lib/utils/billing"

interface PatientInfoCardProps {
  data: PatientDetail
}

export function PatientInfoCard({ data }: PatientInfoCardProps) {
  const { patient, bedAssignment, daysInHospital, totalRoomCost } = data

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Patient Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Pasien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <IconUser className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Nama Lengkap</p>
                <p className="font-medium">{patient.patientName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-muted-foreground mt-0.5 h-4 w-4">
                {patient.gender === "M" ? (
                  <IconGenderMale className="h-4 w-4" />
                ) : (
                  <IconGenderFemale className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Jenis Kelamin</p>
                <p className="font-medium">
                  {patient.gender === "M"
                    ? "Laki-laki"
                    : patient.gender === "F"
                      ? "Perempuan"
                      : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCalendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Tanggal Lahir / Usia</p>
                <p className="font-medium">
                  {patient.dateOfBirth
                    ? `${formatDate(patient.dateOfBirth)} (${getAgeDisplay(patient.dateOfBirth)})`
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconUser className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">NIK</p>
                <p className="font-medium">{patient.nik || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconPhone className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Telepon</p>
                <p className="font-medium">{patient.phone || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconMapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Alamat</p>
                <p className="font-medium">{patient.address || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconUser className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Asuransi</p>
                <p className="font-medium">{patient.insurance || "Umum"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admission & Room Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Rawat Inap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <IconCalendarEvent className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Tanggal Masuk</p>
                <p className="font-medium">
                  {patient.admissionDate ? formatDateTime(patient.admissionDate) : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCalendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Lama Rawat Inap</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{daysInHospital} hari</p>
                  {daysInHospital > 7 && (
                    <Badge variant="destructive" className="text-xs">
                      Rawat Lama
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {bedAssignment ? (
              <>
                <div className="flex items-start gap-3">
                  <IconBed className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Ruang & Tempat Tidur</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{bedAssignment.roomNumber}</Badge>
                      <span className="text-sm">•</span>
                      <Badge variant="secondary">Bed {bedAssignment.bedNumber}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconBed className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Tipe Ruangan</p>
                    <Badge>{bedAssignment.roomType}</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconCurrencyDollar className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Tarif Ruangan per Hari</p>
                    <p className="font-medium">
                      {formatCurrency(parseFloat(bedAssignment.dailyRate))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconCurrencyDollar className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Total Biaya Ruangan</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(parseFloat(totalRoomCost))}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {daysInHospital} hari × {formatCurrency(parseFloat(bedAssignment.dailyRate))}
                    </p>
                  </div>
                </div>

                {bedAssignment.notes && (
                  <div className="flex items-start gap-3">
                    <IconUser className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div className="flex-1 space-y-1">
                      <p className="text-muted-foreground text-sm">Catatan</p>
                      <p className="text-sm">{bedAssignment.notes}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                Pasien belum ditempatkan di kamar
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
