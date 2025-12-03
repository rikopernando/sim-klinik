/**
 * ER Queue Item Component
 * Individual patient card in the ER queue
 * H.1.3: Added handover functionality
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, FileText, User, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ERQueueItem } from "@/types/emergency"
import {
  getTriageBadgeColor,
  getTriageLabel,
  getTriageCardClasses,
} from "@/lib/emergency/triage-utils"
import { HandoverDialog } from "./handover-dialog"

interface ERQueueItemProps {
  item: ERQueueItem
  index: number
  onStartExamination?: (visitId: number) => void
  onHandoverSuccess?: () => void
}

export function ERQueueItemCard({
  item,
  index,
  onStartExamination,
  onHandoverSuccess,
}: ERQueueItemProps) {
  const [showHandoverDialog, setShowHandoverDialog] = useState(false)

  return (
    <>
      <Card
        className={`transition-all hover:shadow-md ${getTriageCardClasses(item.visit.triageStatus)}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* Queue Number */}
                <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold">
                  {index + 1}
                </div>

                {/* Patient Info */}
                <div>
                  <CardTitle className="text-xl">{item.patient.name}</CardTitle>
                  <div className="text-muted-foreground flex gap-2 text-sm">
                    <span>MR: {item.patient.mrNumber}</span>
                    {item.patient.nik && <span>• NIK: {item.patient.nik}</span>}
                    {item.patient.gender && (
                      <span>• {item.patient.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Triage Badge */}
            <Badge className={getTriageBadgeColor(item.visit.triageStatus)}>
              {getTriageLabel(item.visit.triageStatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Chief Complaint */}
            {item.visit.chiefComplaint && (
              <div className="flex gap-2">
                <FileText className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Keluhan Utama:</p>
                  <p className="text-muted-foreground text-sm">{item.visit.chiefComplaint}</p>
                </div>
              </div>
            )}

            {/* Footer: Arrival Time & Actions */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Tiba:{" "}
                  {formatDistanceToNow(new Date(item.visit.arrivalTime), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </span>
              </div>

              <div className="flex gap-2">
                {onStartExamination && (
                  <Button size="sm" onClick={() => onStartExamination(item.visit.id)}>
                    <User className="mr-2 h-4 w-4" />
                    Mulai Pemeriksaan
                  </Button>
                )}

                {/* Handover Button (H.1.3) */}
                <Button size="sm" variant="outline" onClick={() => setShowHandoverDialog(true)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Handover
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handover Dialog (H.1.3) */}
      <HandoverDialog
        open={showHandoverDialog}
        onOpenChange={setShowHandoverDialog}
        visitId={item.visit.id}
        patientName={item.patient.name}
        onSuccess={() => {
          setShowHandoverDialog(false)
          if (onHandoverSuccess) {
            onHandoverSuccess()
          }
        }}
      />
    </>
  )
}
