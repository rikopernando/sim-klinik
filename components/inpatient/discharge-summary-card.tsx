/**
 * Discharge Summary Card Component
 * Displays the discharge summary (Resume Medis) information
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  IconFileDescription,
  IconStethoscope,
  IconPill,
  IconClipboardList,
  IconApple,
  IconActivity,
  IconCalendar,
  IconUser,
  IconLock,
} from "@tabler/icons-react"
import { formatDate, formatDateTime } from "@/lib/utils/date"

interface DischargeSummary {
  id: string
  visitId: string
  admissionDiagnosis: string
  dischargeDiagnosis: string
  clinicalSummary: string
  proceduresPerformed: string | null
  medicationsOnDischarge: string | null
  dischargeInstructions: string
  dietaryRestrictions: string | null
  activityRestrictions: string | null
  followUpDate: Date | null
  followUpInstructions: string | null
  dischargedBy: string
  dischargedAt: Date
  dischargedByName?: string
}

interface DischargeSummaryCardProps {
  dischargeSummary: DischargeSummary
}

export function DischargeSummaryCard({ dischargeSummary }: DischargeSummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Header Card with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconFileDescription className="h-5 w-5" />
              Ringkasan Medis Pulang (Resume Medis)
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <IconLock className="h-3 w-3" />
              Visit Terkunci
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <IconUser className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Dibuat Oleh</p>
                <p className="font-medium">
                  {dischargeSummary.dischargedByName || dischargeSummary.dischargedBy}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCalendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1 space-y-1">
                <p className="text-muted-foreground text-sm">Tanggal & Waktu</p>
                <p className="font-medium">{formatDateTime(dischargeSummary.dischargedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconStethoscope className="h-5 w-5" />
            Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Diagnosis Masuk</Badge>
              </div>
              <p className="text-sm leading-relaxed">{dischargeSummary.admissionDiagnosis}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default">Diagnosis Pulang</Badge>
              </div>
              <p className="text-sm leading-relaxed">{dischargeSummary.dischargeDiagnosis}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconClipboardList className="h-5 w-5" />
            Ringkasan Klinis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {dischargeSummary.clinicalSummary}
          </p>
        </CardContent>
      </Card>

      {/* Procedures & Medications Card */}
      {(dischargeSummary.proceduresPerformed || dischargeSummary.medicationsOnDischarge) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconPill className="h-5 w-5" />
              Tindakan & Obat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dischargeSummary.proceduresPerformed && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Tindakan yang Dilakukan</Badge>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {dischargeSummary.proceduresPerformed}
                  </p>
                </div>
              )}

              {dischargeSummary.proceduresPerformed && dischargeSummary.medicationsOnDischarge && (
                <Separator />
              )}

              {dischargeSummary.medicationsOnDischarge && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Obat untuk Dibawa Pulang</Badge>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {dischargeSummary.medicationsOnDischarge}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discharge Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconClipboardList className="h-5 w-5" />
            Instruksi Pulang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {dischargeSummary.dischargeInstructions}
          </p>
        </CardContent>
      </Card>

      {/* Restrictions Card */}
      {(dischargeSummary.dietaryRestrictions || dischargeSummary.activityRestrictions) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pembatasan & Pantangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dischargeSummary.dietaryRestrictions && (
                <div className="flex items-start gap-3">
                  <IconApple className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Pantangan Makanan</p>
                    <p className="text-sm leading-relaxed">
                      {dischargeSummary.dietaryRestrictions}
                    </p>
                  </div>
                </div>
              )}

              {dischargeSummary.dietaryRestrictions && dischargeSummary.activityRestrictions && (
                <Separator />
              )}

              {dischargeSummary.activityRestrictions && (
                <div className="flex items-start gap-3">
                  <IconActivity className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Pembatasan Aktivitas</p>
                    <p className="text-sm leading-relaxed">
                      {dischargeSummary.activityRestrictions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow Up Card */}
      {(dischargeSummary.followUpDate || dischargeSummary.followUpInstructions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconCalendar className="h-5 w-5" />
              Rencana Kontrol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dischargeSummary.followUpDate && (
                <div className="flex items-start gap-3">
                  <IconCalendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Tanggal Kontrol</p>
                    <Badge variant="default" className="font-medium">
                      {formatDate(dischargeSummary.followUpDate)}
                    </Badge>
                  </div>
                </div>
              )}

              {dischargeSummary.followUpDate && dischargeSummary.followUpInstructions && (
                <Separator />
              )}

              {dischargeSummary.followUpInstructions && (
                <div className="flex items-start gap-3">
                  <IconClipboardList className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="flex-1 space-y-1">
                    <p className="text-muted-foreground text-sm">Instruksi Kontrol</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {dischargeSummary.followUpInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
