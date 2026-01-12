/**
 * History Procedures Tab Component
 * Displays procedures list for a medical record
 */

import { TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Procedure {
  id: string
  icd9Code: string | null
  description: string
}

interface HistoryProceduresTabProps {
  procedures: Procedure[]
}

const ProcedureItem = ({ procedure }: { procedure: Procedure }) => (
  <div className="bg-muted rounded-md p-2">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium">{procedure.description}</p>
      <Badge variant="outline" className="text-xs">
        {procedure.icd9Code}
      </Badge>
    </div>
  </div>
)

const EmptyProcedures = () => (
  <p className="text-muted-foreground py-4 text-center text-sm">Tidak ada tindakan</p>
)

export function HistoryProceduresTab({ procedures }: HistoryProceduresTabProps) {
  return (
    <TabsContent value="procedures" className="mt-3">
      {procedures.length === 0 ? (
        <EmptyProcedures />
      ) : (
        <div className="space-y-2">
          {procedures.map((procedure) => (
            <ProcedureItem key={procedure.id} procedure={procedure} />
          ))}
        </div>
      )}
    </TabsContent>
  )
}
