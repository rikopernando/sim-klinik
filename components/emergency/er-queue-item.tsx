import { useState, memo, useEffect } from "react"
import {
  Clock,
  FileText,
  User,
  ArrowRight,
  AlertTriangle,
  MoreHorizontal,
  Pencil,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ERQueueItem } from "@/types/emergency"
import {
  getTriageBadgeColor,
  getTriageLabelShort,
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
  const isActionable = item.visit.status === "in_examination" || item.visit.status === "registered"

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
              {getTriageLabelShort(item.visit.triageStatus)}
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

        {/* Bottom row: wait time + actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
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

          {isActionable && (
            <div className="flex shrink-0 gap-2">
              {/* Primary CTA */}
              <Button
                size="sm"
                onClick={() => onStartExamination?.(item.visit.id, item.visit.status)}
              >
                {item.visit.status === "registered" ? (
                  <User className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                )}
                {item.visit.status === "registered" ? "Mulai Pemeriksaan" : "Lanjutkan"}
              </Button>

              {/* Secondary actions in dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="px-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit Kunjungan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowHandoverDialog(true)}>
                    <ArrowRight className="mr-2 h-3.5 w-3.5" />
                    Handover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
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
