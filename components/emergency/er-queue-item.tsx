/**
 * ER Queue Item Component
 * Individual patient card in the ER queue
 * H.1.3: Added handover functionality
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import { useState, memo, useEffect } from "react"
import { Clock, FileText, User, ArrowRight, AlertTriangle, Pencil } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ERQueueItem } from "@/types/emergency"
import {
  getTriageBadgeColor,
  getTriageLabel,
  getTriageCardClasses,
  calculateWaitTimeMinutes,
  formatWaitTime,
  getWaitTimeAlertLevel,
} from "@/lib/emergency/triage-utils"
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog"
import type { EditVisitData } from "@/lib/validations/edit-visit"
import { cn } from "@/lib/utils"

import { HandoverDialog } from "./handover-dialog"

interface ERQueueItemProps {
  item: ERQueueItem
  index: number
  onStartExamination?: (visitId: string, visitStatus: string) => void
  onHandoverSuccess?: () => void
  onEditSuccess?: () => void
  isNew?: boolean // Flag for newly arrived patients (highlight animation)
}

function ERQueueItemCardComponent({
  item,
  index,
  onStartExamination,
  onHandoverSuccess,
  onEditSuccess,
  isNew = false,
}: ERQueueItemProps) {
  const [showHandoverDialog, setShowHandoverDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [waitTimeMinutes, setWaitTimeMinutes] = useState(() =>
    calculateWaitTimeMinutes(item.visit.arrivalTime)
  )

  // Update wait time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTimeMinutes(calculateWaitTimeMinutes(item.visit.arrivalTime))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [item.visit.arrivalTime])

  // Check if patient has incomplete registration (missing NIK)
  const isIncompleteRegistration = !item.patient.nik

  // Get wait time alert level
  const waitTimeAlert = getWaitTimeAlertLevel(item.visit.arrivalTime, item.visit.triageStatus)

  // Check if this is a critical (Red triage) patient
  const isCritical = item.visit.triageStatus === "red"

  return (
    <>
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          getTriageCardClasses(item.visit.triageStatus),
          // Pulsing border animation for Red triage patients
          isCritical && "animate-pulse-border",
          // Highlight animation for newly arrived patients
          isNew && "ring-2 ring-blue-500 ring-offset-2"
        )}
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

            {/* Badges */}
            <div className="flex flex-col items-end gap-2">
              <Badge className={getTriageBadgeColor(item.visit.triageStatus)}>
                {getTriageLabel(item.visit.triageStatus)}
              </Badge>
              {isIncompleteRegistration && (
                <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-700">
                  Data Belum Lengkap
                </Badge>
              )}
            </div>
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

            {/* Footer: Wait Time & Actions */}
            <div className="flex items-center justify-between text-sm">
              <div
                className={cn(
                  "flex items-center gap-2",
                  waitTimeAlert === "critical" && "font-semibold text-red-600",
                  waitTimeAlert === "warning" && "text-orange-600",
                  waitTimeAlert === "normal" && "text-muted-foreground"
                )}
              >
                {waitTimeAlert !== "normal" && <AlertTriangle className="h-4 w-4" />}
                <Clock className="h-4 w-4" />
                <span>Menunggu: {formatWaitTime(waitTimeMinutes)}</span>
              </div>

              {(item.visit.status === "in_examination" || item.visit.status === "registered") && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowEditDialog(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onStartExamination?.(item.visit.id, item.visit.status)}
                  >
                    {item.visit.status === "registered" ? (
                      <User className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    {item.visit.status === "registered" ? "Mulai Pemeriksaan" : "Lanjutkan"}
                  </Button>

                  {/* Handover Button (H.1.3) */}
                  <Button size="sm" variant="outline" onClick={() => setShowHandoverDialog(true)}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Handover
                  </Button>
                </div>
              )}
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

      {/* Edit Visit Dialog */}
      <EditVisitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        visitData={
          {
            visit: {
              id: item.visit.id,
              visitNumber: item.visit.visitNumber,
              visitType: item.visit.visitType,
              status: item.visit.status,
              arrivalTime: item.visit.arrivalTime,
              triageStatus: item.visit.triageStatus,
              notes: item.visit.notes,
              chiefComplaint: item.visit.chiefComplaint,
            },
            patient: {
              id: item.patient.id,
              mrNumber: item.patient.mrNumber,
              name: item.patient.name,
              gender: item.patient.gender,
            },
          } satisfies EditVisitData
        }
        onSuccess={() => {
          onEditSuccess?.()
        }}
      />
    </>
  )
}

/**
 * Memoized version to prevent unnecessary re-renders
 * Re-renders only when item, index, or callbacks change
 */
export const ERQueueItemCard = memo(ERQueueItemCardComponent)
