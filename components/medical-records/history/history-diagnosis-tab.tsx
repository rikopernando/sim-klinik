/**
 * History Diagnosis Tab Component
 * Displays diagnosis list for a medical record
 */

import { TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Diagnosis {
  id: number
  icd10Code: string
  description: string
  diagnosisType: string
}

interface HistoryDiagnosisTabProps {
  diagnoses: Diagnosis[]
}

const DiagnosisItem = ({ diagnosis }: { diagnosis: Diagnosis }) => (
  <div className="bg-muted rounded-md p-2">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium">{diagnosis.description}</p>
      <Badge variant="outline" className="text-xs">
        {diagnosis.icd10Code}
      </Badge>
    </div>
    {diagnosis.diagnosisType === "primary" && (
      <Badge variant="secondary" className="mt-1 text-xs">
        Diagnosis Utama
      </Badge>
    )}
  </div>
)

const EmptyDiagnosis = () => (
  <p className="text-muted-foreground py-4 text-center text-sm">Tidak ada diagnosis</p>
)

export function HistoryDiagnosisTab({ diagnoses }: HistoryDiagnosisTabProps) {
  return (
    <TabsContent value="diagnosis" className="mt-3">
      {diagnoses.length === 0 ? (
        <EmptyDiagnosis />
      ) : (
        <div className="space-y-2">
          {diagnoses.map((diagnosis) => (
            <DiagnosisItem key={diagnosis.id} diagnosis={diagnosis} />
          ))}
        </div>
      )}
    </TabsContent>
  )
}
