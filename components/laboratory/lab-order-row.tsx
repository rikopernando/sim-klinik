/**
 * Lab Order Row Component
 * Individual row in lab order queue with action buttons
 */

"use client"

import { useState } from "react"
import {
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconPlayerPlay,
  IconDroplet,
} from "@tabler/icons-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useUpdateLabOrderStatus } from "@/hooks/use-update-lab-order-status"
import { usePermission } from "@/hooks/use-permission"
import type { LabOrderWithRelations } from "@/types/lab"

import { CollectSpecimenDialog } from "./collect-specimen-dialog"
import { ResultEntryDialog } from "./result-entry-dialog"
import { OrderDetailDialog } from "./order-detail-dialog"
import { VerifyResultDialog } from "./verify-result-dialog"

interface LabOrderRowProps {
  order: LabOrderWithRelations
  index: number
  onSuccess?: () => void
}

export function LabOrderRow({ order, index, onSuccess }: LabOrderRowProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { hasPermission } = usePermission()

  const { updateStatus } = useUpdateLabOrderStatus({
    onSuccess: () => {
      setIsProcessing(false)
      onSuccess?.()
    },
    onError: () => {
      setIsProcessing(false)
    },
  })

  const handleStartProcessing = async () => {
    setIsProcessing(true)
    await updateStatus(order.id, { status: "in_progress" })
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default">
            <IconCheck className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary">
            <IconCheck className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600">
            <IconClock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "specimen_collected":
        return (
          <Badge variant="outline" className="border-blue-600 text-blue-600">
            <IconDroplet className="mr-1 h-3 w-3" />
            Specimen Collected
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
            <IconClock className="mr-1 h-3 w-3" />
            Ordered
          </Badge>
        )
      case "cancelled":
      case "rejected":
        return (
          <Badge variant="destructive">
            <IconAlertCircle className="mr-1 h-3 w-3" />
            {status === "cancelled" ? "Cancelled" : "Rejected"}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const getActionButtons = () => {
    switch (order.status) {
      case "ordered":
        return <CollectSpecimenDialog order={order} onSuccess={onSuccess} />
      case "specimen_collected":
        return (
          <Button
            size="sm"
            variant="default"
            onClick={handleStartProcessing}
            disabled={isProcessing}
          >
            <IconPlayerPlay className="mr-2 h-4 w-4" />
            Mulai Proses
          </Button>
        )
      case "in_progress":
        return <ResultEntryDialog order={order} onSuccess={onSuccess} />
      case "completed":
        // Show Verify button for lab supervisors, otherwise show detail
        if (hasPermission("lab:write") && order.result && !order.result.isVerified) {
          return (
            <div className="flex gap-2">
              <VerifyResultDialog order={order} onSuccess={onSuccess} />
              <OrderDetailDialog orderId={order.id} />
            </div>
          )
        }
        return <OrderDetailDialog orderId={order.id} />
      case "verified":
        return <OrderDetailDialog orderId={order.id} />
      default:
        return null
    }
  }

  // Determine if this is a panel parent or child order
  const isPanel = !!order.panel
  const isPanelChild = !!order.parentOrderId
  const displayName = isPanel
    ? order.panel?.name
    : order.test?.name || (isPanelChild ? "Panel Test" : "Unknown")
  const displayDepartment = order.test?.department || (isPanel ? "LAB" : "Unknown")

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{index + 1}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{displayName}</h4>
            {isPanel && (
              <Badge variant="outline" className="border-primary text-primary text-xs">
                Panel
              </Badge>
            )}
            {isPanelChild && (
              <Badge variant="outline" className="text-xs">
                Panel Test
              </Badge>
            )}
            <Badge
              variant={displayDepartment === "LAB" ? "secondary" : "default"}
              className="text-xs"
            >
              {displayDepartment}
            </Badge>
            {order.urgency && order.urgency !== "routine" && (
              <Badge
                variant={order.urgency === "stat" ? "destructive" : "default"}
                className={order.urgency === "urgent" ? "bg-orange-500" : ""}
              >
                {order.urgency.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{order.patient.name}</span>
              <span>•</span>
              <span className="font-mono">{order.patient.mrNumber}</span>
            </div>
            {order.clinicalIndication && (
              <p className="line-clamp-1">
                <span className="font-medium">Indikasi:</span> {order.clinicalIndication}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground font-mono">{order.orderNumber}</p>
          <p className="text-muted-foreground">
            {formatDistanceToNow(new Date(order.orderedAt), {
              addSuffix: true,
              locale: idLocale,
            })}
          </p>
          <p className="text-muted-foreground">oleh {order.orderedByUser.name}</p>
          {order.test?.tatHours && order.status === "ordered" && (
            <p className="text-primary font-medium">TAT: {order.test.tatHours}h</p>
          )}
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell className="text-right">{getActionButtons()}</TableCell>
    </TableRow>
  )
}
