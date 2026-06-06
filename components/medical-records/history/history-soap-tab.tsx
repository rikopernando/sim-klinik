/**
 * History SOAP Tab Component
 * Displays SOAP notes for a medical record
 */

import { TabsContent } from "@/components/ui/tabs"

interface SOAPData {
  soapSubjective: string | null
  soapObjective: string | null
  soapAssessment: string | null
  soapPlan: string | null
}

interface HistorySOAPTabProps {
  soap: SOAPData
}

const SOAP_LABELS: Record<string, { letter: string; label: string; color: string }> = {
  S: { letter: "S", label: "Subjective", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  O: { letter: "O", label: "Objective", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  A: { letter: "A", label: "Assessment", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  P: { letter: "P", label: "Plan", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
}

const SOAPSection = ({ type, content }: { type: keyof typeof SOAP_LABELS; content: string }) => {
  const meta = SOAP_LABELS[type]
  return (
    <div className="flex gap-3">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${meta.color}`}>
        {meta.letter}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{meta.label}</p>
        <p className="mt-0.5 text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

const EmptySOAP = () => (
  <p className="text-muted-foreground py-4 text-center text-sm">Tidak ada catatan SOAP</p>
)

export function HistorySOAPTab({ soap }: HistorySOAPTabProps) {
  const hasAnySOAP =
    soap.soapSubjective || soap.soapObjective || soap.soapAssessment || soap.soapPlan

  return (
    <TabsContent value="soap" className="mt-3 space-y-3">
      {hasAnySOAP ? (
        <>
          {soap.soapSubjective && <SOAPSection type="S" content={soap.soapSubjective} />}
          {soap.soapObjective && <SOAPSection type="O" content={soap.soapObjective} />}
          {soap.soapAssessment && <SOAPSection type="A" content={soap.soapAssessment} />}
          {soap.soapPlan && <SOAPSection type="P" content={soap.soapPlan} />}
        </>
      ) : (
        <EmptySOAP />
      )}
    </TabsContent>
  )
}
