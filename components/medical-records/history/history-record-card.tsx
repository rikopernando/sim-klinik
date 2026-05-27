/**
 * History Record Card Component
 * Displays a single medical record with all its data in tabs
 */

import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { MedicalRecordHistory } from "@/types/medical-record"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { HistorySOAPTab } from "./history-soap-tab"
import { HistoryDiagnosisTab } from "./history-diagnosis-tab"
import { HistoryProceduresTab } from "./history-procedures-tab"
import { HistoryPrescriptionsTab } from "./history-prescriptions-tab"

interface HistoryRecordCardProps {
  record: MedicalRecordHistory
  visitNumber: number
}

const formatDate = (date: string | Date) => {
  try {
    return format(new Date(date), "dd MMMM yyyy, HH:mm", { locale: idLocale })
  } catch {
    return "N/A"
  }
}

export function HistoryRecordCard({ record, visitNumber }: HistoryRecordCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="flex items-start justify-between border-b px-4 py-3">
        <div>
          <p className="font-semibold">Kunjungan #{visitNumber}</p>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            <Calendar className="h-3 w-3" />
            {formatDate(record.medicalRecord.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs">
            {record.visit.visitNumber}
          </Badge>
          {record.medicalRecord.isLocked && (
            <Badge variant="secondary" className="text-xs">
              Terkunci
            </Badge>
          )}
        </div>
      </div>
      <div className="px-4 py-3">
        <Tabs defaultValue="soap" className="w-full">
          <TabsList className="inline-flex">
            <TabsTrigger value="soap">SOAP</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis ({record.diagnoses.length})</TabsTrigger>
            <TabsTrigger value="procedures">Tindakan ({record.procedures.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Resep ({record.prescriptions.length})</TabsTrigger>
          </TabsList>

          <HistorySOAPTab soap={record.medicalRecord} />
          <HistoryDiagnosisTab diagnoses={record.diagnoses} />
          <HistoryProceduresTab procedures={record.procedures} />
          <HistoryPrescriptionsTab prescriptions={record.prescriptions} />
        </Tabs>
      </div>
    </div>
  )
}
