/**
 * CPPT History Card Component
 * Displays history of CPPT (Integrated Progress Notes) entries
 */

import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { IconUser, IconClock } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CPPT } from "@/types/inpatient"

interface CPPTHistoryCardProps {
  entries: CPPT[]
}

export function CPPTHistoryCard({ entries }: CPPTHistoryCardProps) {
  if (entries.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">Belum ada catatan CPPT</div>
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconUser className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">{entry.authorId}</span>
                <Badge variant={entry.authorRole === "doctor" ? "default" : "secondary"}>
                  {entry.authorRole === "doctor" ? "Dokter" : "Perawat"}
                </Badge>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <IconClock className="h-4 w-4" />
                {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
              </div>
            </div>

            {/* SOAP Notes */}
            <div className="grid gap-3 rounded-md border p-4">
              {entry.subjective && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-semibold">Subjective</p>
                  <p className="text-sm">{entry.subjective}</p>
                </div>
              )}

              {entry.objective && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-semibold">Objective</p>
                  <p className="text-sm">{entry.objective}</p>
                </div>
              )}

              {entry.assessment && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-semibold">Assessment</p>
                  <p className="text-sm">{entry.assessment}</p>
                </div>
              )}

              {entry.plan && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-semibold">Plan</p>
                  <p className="text-sm">{entry.plan}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-semibold">Catatan Progress</p>
                <p className="text-sm">{entry.progressNote}</p>
              </div>

              {entry.instructions && (
                <div>
                  <p className="text-muted-foreground mb-1 text-sm font-semibold">Instruksi</p>
                  <p className="text-sm">{entry.instructions}</p>
                </div>
              )}
            </div>
          </div>

          {index < entries.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
