import { useState, memo, useEffect } from "react"
import { Clock, FileText, User, ArrowRight, AlertTriangle, Pencil } from "lucide-react"

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
  isNew?: boolean
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

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTimeMinutes(calculateWaitTimeMinutes(item.visit.arrivalTime))
    }, 60000)
    return () => clearInterval(interval)
  }, [item.visit.arrivalTime])

  const isIncompleteRegistration = !item.patient.nik
  const waitTimeAlert = getWaitTimeAlertLevel(item.visit.arrivalTime, item.visit.triageStatus)
  const isCritical = item.visit.triageStatus === "red"

  return (
    <>
      <div
        className={cn(
          "rounded-xl border p-4 transition-all hover:shadow-md",
          getTriageCardClasses(item.visit.triageStatus),
          isCritical && "animate-pulse-border",
          isNew && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        {/* Top row: queue number + patient name + triage badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.patient.name}</p>
              <p className="text-muted-foreground text-xs">
                MR: {item.patient.mrNumber}
                {item.patient.nik && ` · NIK: ${item.patient.nik}`}
                {item.patient.gender &&
                  ` · ${item.patient.gender === "male" ? "Laki-laki" : "Perempuan"}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
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

        {/* Chief complaint */}
        {item.visit.chiefComplaint && (
          <div className="mt-3 flex gap-2">
            <FileText className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-xs font-medium">Keluhan Utama:</p>
              <p className="text-muted-foreground text-xs">{item.visit.chiefComplaint}</p>
            </div>
          </div>
        )}

        {/* Bottom row: wait time + action buttons */}
        {(item.visit.status === "in_examination" || item.visit.status === "registered") && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm",
                waitTimeAlert === "critical" && "font-semibold text-red-600",
                waitTimeAlert === "warning" && "text-orange-600",
                waitTimeAlert === "normal" && "text-muted-foreground"
              )}
            >
              {waitTimeAlert !== "normal" && <AlertTriangle className="h-3.5 w-3.5" />}
              <Clock className="h-3.5 w-3.5" />
              <span>Menunggu: {formatWaitTime(waitTimeMinutes)}</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => onStartExamination?.(item.visit.id, item.visit.status)}
              >
                {item.visit.status === "registered" ? (
                  <User className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                )}
                {item.visit.status === "registered" ? "Mulai Pemeriksaan" : "Lanjutkan"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowHandoverDialog(true)}>
                <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                Handover
              </Button>
            </div>
          </div>
        )}

        {/* Wait time only (no actions) for examined status */}
        {item.visit.status !== "in_examination" && item.visit.status !== "registered" && (
          <div
            className={cn(
              "mt-3 flex items-center gap-1.5 text-sm",
              waitTimeAlert === "critical" && "font-semibold text-red-600",
              waitTimeAlert === "warning" && "text-orange-600",
              waitTimeAlert === "normal" && "text-muted-foreground"
            )}
          >
            {waitTimeAlert !== "normal" && <AlertTriangle className="h-3.5 w-3.5" />}
            <Clock className="h-3.5 w-3.5" />
            <span>Menunggu: {formatWaitTime(waitTimeMinutes)}</span>
          </div>
        )}
      </div>

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

export const ERQueueItemCard = memo(ERQueueItemCardComponent)
