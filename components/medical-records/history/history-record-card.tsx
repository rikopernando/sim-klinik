/**
 * History Record Card Component
 * Displays a single medical record with all its data in tabs
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { HistorySOAPTab } from "./history-soap-tab"
import { HistoryDiagnosisTab } from "./history-diagnosis-tab"
import { HistoryProceduresTab } from "./history-procedures-tab"
import { HistoryPrescriptionsTab } from "./history-prescriptions-tab"

interface MedicalRecordData {
  medicalRecord: {
    id: number
    isLocked: boolean
    soapSubjective: string | null
    soapObjective: string | null
    soapAssessment: string | null
    soapPlan: string | null
    createdAt: Date
  }
  visit: {
    visitNumber: string
  }
  diagnoses: Array<{
    id: number
    icd10Code: string
    description: string
    diagnosisType: string
  }>
  procedures: Array<{
    id: number
    icd9Code: string
    description: string
  }>
  prescriptions: Array<{
    prescription: {
      id: number
      dosage: string
      frequency: string
      duration: string | null
      instructions: string | null
      isFulfilled: boolean
    }
    drug: {
      name: string
    } | null
  }>
}

interface HistoryRecordCardProps {
  record: MedicalRecordData
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
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Kunjungan #{visitNumber}</CardTitle>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(record.medicalRecord.createdAt)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline">{record.visit.visitNumber}</Badge>
            {record.medicalRecord.isLocked && <Badge variant="secondary">Terkunci</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="soap" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
      </CardContent>
    </Card>
  )
}
