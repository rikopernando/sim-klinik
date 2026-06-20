import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconLock, IconCalendar } from "@tabler/icons-react"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
      {children}
    </p>
  )
}

export function DischargeSummaryCard({ dischargeSummary }: DischargeSummaryCardProps) {
  const hasRestrictions =
    dischargeSummary.dietaryRestrictions || dischargeSummary.activityRestrictions
  const hasFollowUp =
    dischargeSummary.followUpDate || dischargeSummary.followUpInstructions
  const hasProceduresOrMeds =
    dischargeSummary.proceduresPerformed || dischargeSummary.medicationsOnDischarge

  return (
    <Card>
      {/* Compact metadata header */}
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Ringkasan Medis Pulang</p>
            <p className="text-muted-foreground text-xs">
              {dischargeSummary.dischargedByName || dischargeSummary.dischargedBy} ·{" "}
              {formatDateTime(dischargeSummary.dischargedAt)}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <IconLock className="h-3 w-3" />
            Visit Terkunci
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Diagnosis */}
        <div>
          <SectionLabel>Diagnosis</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-muted-foreground mb-1 text-xs">Masuk</p>
              <p className="text-sm leading-relaxed">{dischargeSummary.admissionDiagnosis}</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-muted-foreground mb-1 text-xs">Pulang</p>
              <p className="text-sm font-medium leading-relaxed">
                {dischargeSummary.dischargeDiagnosis}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Ringkasan Klinis */}
        <div>
          <SectionLabel>Ringkasan Klinis</SectionLabel>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {dischargeSummary.clinicalSummary}
          </p>
        </div>

        {hasProceduresOrMeds && (
          <>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              {dischargeSummary.proceduresPerformed && (
                <div>
                  <SectionLabel>Tindakan yang Dilakukan</SectionLabel>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {dischargeSummary.proceduresPerformed}
                  </p>
                </div>
              )}
              {dischargeSummary.medicationsOnDischarge && (
                <div>
                  <SectionLabel>Obat Dibawa Pulang</SectionLabel>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {dischargeSummary.medicationsOnDischarge}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Instruksi Pulang */}
        <div>
          <SectionLabel>Instruksi Pulang</SectionLabel>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {dischargeSummary.dischargeInstructions}
          </p>
        </div>

        {hasRestrictions && (
          <>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              {dischargeSummary.dietaryRestrictions && (
                <div>
                  <SectionLabel>Pantangan Makanan</SectionLabel>
                  <p className="text-sm leading-relaxed">{dischargeSummary.dietaryRestrictions}</p>
                </div>
              )}
              {dischargeSummary.activityRestrictions && (
                <div>
                  <SectionLabel>Pembatasan Aktivitas</SectionLabel>
                  <p className="text-sm leading-relaxed">
                    {dischargeSummary.activityRestrictions}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {hasFollowUp && (
          <>
            <Separator />
            <div>
              <SectionLabel>Rencana Kontrol</SectionLabel>
              <div className="flex flex-wrap items-start gap-4">
                {dischargeSummary.followUpDate && (
                  <div className="flex items-center gap-1.5 rounded-md border px-3 py-2">
                    <IconCalendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatDate(dischargeSummary.followUpDate)}
                    </span>
                  </div>
                )}
                {dischargeSummary.followUpInstructions && (
                  <p className="text-muted-foreground flex-1 text-sm leading-relaxed">
                    {dischargeSummary.followUpInstructions}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
