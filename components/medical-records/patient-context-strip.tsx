import { User, Clock } from "lucide-react"
import { differenceInYears, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { type MedicalRecordPatient, type Visit } from "@/types/medical-record"
import { VISIT_STATUS_INFO, type VisitStatus } from "@/types/visit-status"

interface PatientContextStripProps {
  patient: MedicalRecordPatient
  visit: Visit
}

const VISIT_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  outpatient: {
    label: "Rawat Jalan",
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300",
  },
  emergency: {
    label: "UGD",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300",
  },
  inpatient: {
    label: "Rawat Inap",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
}

const GENDER_LABELS: Record<string, string> = {
  male: "Laki-laki",
  female: "Perempuan",
}

export function PatientContextStrip({ patient, visit }: PatientContextStripProps) {
  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), new Date(patient.dateOfBirth))
    : null

  const gender = patient.gender ? (GENDER_LABELS[patient.gender] ?? patient.gender) : null

  const config = VISIT_CONFIG[visit.visitType] ?? {
    label: visit.visitType,
    badgeClass: "",
  }

  const arrivalDate = format(new Date(visit.arrivalTime), "dd MMM yyyy, HH:mm", {
    locale: idLocale,
  })

  return (
    <div className="bg-muted/30 border-b">
      <div className="container mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-2.5">
        {/* Patient name */}
        <div className="flex items-center gap-1.5">
          <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          <span className="text-sm font-semibold">{patient.name}</span>
        </div>

        {age !== null && <span className="text-muted-foreground text-sm">{age} tahun</span>}

        {gender && <span className="text-muted-foreground text-sm">{gender}</span>}

        <span className="bg-border h-4 w-px shrink-0" />

        <span className="text-muted-foreground font-mono text-xs">MR: {patient.mrNumber}</span>

        <span className="bg-border h-4 w-px shrink-0" />

        {patient.poliName && (
          <span className="text-muted-foreground text-sm">{patient.poliName}</span>
        )}

        <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
          {config.label}
        </Badge>

        {(() => {
          const statusInfo = VISIT_STATUS_INFO[visit.status as VisitStatus]
          if (!statusInfo) return null
          return (
            <Badge
              variant="outline"
              className={`text-xs ${statusInfo.color} ${statusInfo.bgColor} border-current/20`}
            >
              {statusInfo.label}
            </Badge>
          )
        })()}

        <span className="bg-border h-4 w-px shrink-0" />

        <div className="flex items-center gap-1">
          <Clock className="text-muted-foreground h-3 w-3 shrink-0" />
          <span className="text-muted-foreground text-xs">{arrivalDate}</span>
        </div>
      </div>
    </div>
  )
}
