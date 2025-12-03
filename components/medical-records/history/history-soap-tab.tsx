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

const SOAPSection = ({ title, content }: { title: string; content: string }) => (
  <div>
    <p className="text-sm font-semibold">{title}</p>
    <p className="text-muted-foreground text-sm">{content}</p>
  </div>
)

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
          {soap.soapSubjective && (
            <SOAPSection title="Subjective (S)" content={soap.soapSubjective} />
          )}
          {soap.soapObjective && <SOAPSection title="Objective (O)" content={soap.soapObjective} />}
          {soap.soapAssessment && (
            <SOAPSection title="Assessment (A)" content={soap.soapAssessment} />
          )}
          {soap.soapPlan && <SOAPSection title="Plan (P)" content={soap.soapPlan} />}
        </>
      ) : (
        <EmptySOAP />
      )}
    </TabsContent>
  )
}
