/**
 * Order Detail Dialog Component
 * Comprehensive view of lab order with results and timeline
 * Refactored for modularity, type safety, and performance
 */

"use client"

import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { useState, useEffect, useMemo, memo } from "react"
import {
  IconEye,
  IconX,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconDroplet,
  IconFileText,
  IconUser,
} from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLabOrder } from "@/hooks/use-lab-order"
import type { LabOrderWithRelations } from "@/types/lab"

import { ResultDisplay } from "./result-display"
import AttachmentSection from "./lab-attachment"
import { formatDateTime } from "@/lib/utils/date"
import LabBadge from "./lab-badge"

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StatusBadgeProps {
  status: string | null
}

const StatusBadge = memo(({ status }: StatusBadgeProps) => {
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
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>
  }
})
StatusBadge.displayName = "StatusBadge"

// ============================================================================
// TIMELINE COMPONENTS
// ============================================================================

interface TimelineItemProps {
  icon: React.ReactNode
  title: string
  subtitle: string
}

const TimelineItem = memo(({ icon, title, subtitle }: TimelineItemProps) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">{subtitle}</p>
    </div>
  </div>
))
TimelineItem.displayName = "TimelineItem"

interface OrderTimelineProps {
  order: LabOrderWithRelations
}

const OrderTimeline = memo(({ order }: OrderTimelineProps) => (
  <div className="space-y-3">
    <h4 className="font-semibold">Timeline Order</h4>
    <div className="space-y-2">
      <TimelineItem
        icon={<IconClock className="h-4 w-4" />}
        title="Order Dibuat"
        subtitle={`${formatDateTime(order.orderedAt)}  • ${order.orderedByUser.name}`}
      />

      {order.status !== "ordered" && (
        <TimelineItem
          icon={<IconDroplet className="h-4 w-4" />}
          title="Spesimen Collected"
          subtitle="Status updated"
        />
      )}

      {order.result && (
        <TimelineItem
          icon={<IconFileText className="h-4 w-4" />}
          title="Hasil Diinput"
          subtitle={`${formatDateTime(order.result.enteredAt)} • ${order.result.enteredByUser?.name}`}
        />
      )}

      {order.result?.isVerified && order.result.verifiedAt && (
        <TimelineItem
          icon={<IconCheck className="h-4 w-4" />}
          title="Hasil Diverifikasi"
          subtitle={`${formatDateTime(order.result.verifiedAt)} • ${order.result.verifiedByUser?.name}`}
        />
      )}
    </div>
  </div>
))
OrderTimeline.displayName = "OrderTimeline"

// ============================================================================
// MAIN DIALOG COMPONENT
// ============================================================================

interface OrderDetailDialogProps {
  orderId: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function OrderDetailDialog({
  orderId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: OrderDetailDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const { order, loading, refetch } = useLabOrder({
    orderId,
    autoFetch: false,
  })

  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  // Memoize computed values
  const urgencyBadge = useMemo(() => {
    if (!order?.urgency || order.urgency === "routine") return null
    return (
      <Badge
        variant={order.urgency === "stat" ? "destructive" : "default"}
        className={order.urgency === "urgent" ? "bg-orange-500" : ""}
      >
        {order.urgency.toUpperCase()}
      </Badge>
    )
  }, [order?.urgency])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <IconEye className="mr-2 h-4 w-4" />
            Lihat Detail
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Detail Order Laboratorium
          </DialogTitle>
          <DialogDescription>Informasi lengkap order dan hasil pemeriksaan</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !order ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Order tidak ditemukan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {order.test?.name || "Test Unknown"}
                      </h3>
                      <LabBadge departement={order.test?.department || "LAB"} />
                      {urgencyBadge}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">{order.orderNumber}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Pasien</p>
                    <p className="font-medium">{order.patient.name}</p>
                    <p className="font-mono text-xs">{order.patient.mrNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Dipesan oleh</p>
                    <p className="font-medium">{order.orderedByUser.name}</p>
                    <p className="text-xs">
                      {formatDistanceToNow(new Date(order.orderedAt), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                </div>

                {order.clinicalIndication && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-xs">Indikasi Klinis</p>
                      <p className="text-sm">{order.clinicalIndication}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Test Information */}
            {order.test && (
              <div className="space-y-3">
                <h4 className="font-semibold">Informasi Pemeriksaan</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground text-xs">Kode Tes</p>
                    <p className="font-mono font-medium">{order.test.code}</p>
                  </div>
                  {order.test.category && (
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">Kategori</p>
                      <p className="font-medium">{order.test.category}</p>
                    </div>
                  )}
                  {order.test.resultTemplate?.type === "numeric" && (
                    <>
                      <div className="rounded-md border p-3">
                        <p className="text-muted-foreground text-xs">Satuan</p>
                        <p className="font-medium">{order.test.resultTemplate.unit}</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-muted-foreground text-xs">Nilai Rujukan</p>
                        <p className="font-medium">
                          {order.test.resultTemplate.referenceRange.min} -{" "}
                          {order.test.resultTemplate.referenceRange.max}
                        </p>
                      </div>
                    </>
                  )}
                  {order.test.specimenType && (
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">Tipe Spesimen</p>
                      <p className="font-medium">{order.test.specimenType}</p>
                    </div>
                  )}
                  {order.test.tatHours && (
                    <div className="rounded-md border p-3">
                      <p className="text-muted-foreground text-xs">TAT (Turn Around Time)</p>
                      <p className="font-medium">{order.test.tatHours} jam</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Section */}
            {order.result && (
              <div className="space-y-3">
                <h4 className="font-semibold">Hasil Pemeriksaan</h4>

                {order.result.criticalValue && (
                  <Alert variant="destructive">
                    <IconAlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nilai Kritis</AlertTitle>
                    <AlertDescription>
                      Hasil ini ditandai sebagai nilai kritis dan memerlukan perhatian segera
                    </AlertDescription>
                  </Alert>
                )}

                <ResultDisplay resultData={order.result.resultData} />

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground text-xs">Diinput oleh</p>
                    <p className="flex items-center gap-1 font-medium">
                      <IconUser className="h-3 w-3" />
                      {order.result?.enteredByUser?.name}
                    </p>
                    <p className="text-xs">{formatDateTime(order.result.enteredAt)}</p>
                  </div>

                  {order.result.isVerified && order.result.verifiedByUser?.name && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                      <p className="text-muted-foreground text-xs">Diverifikasi oleh</p>
                      <p className="flex items-center gap-1 font-medium">
                        <IconCheck className="h-3 w-3" />
                        {order.result.verifiedByUser?.name}
                      </p>
                      {order.result.verifiedAt && (
                        <p className="text-xs">{formatDateTime(order.result.verifiedAt)}</p>
                      )}
                    </div>
                  )}
                </div>

                {order.result.resultNotes && (
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground text-xs">Catatan Teknisi</p>
                    <p className="text-sm">{order.result.resultNotes}</p>
                  </div>
                )}

                {/* Attachment Display */}
                {order.result.attachmentUrl && (
                  <AttachmentSection
                    attachmentUrl={order.result.attachmentUrl}
                    attachmentType={order.result.attachmentType}
                    orderNumber={order.orderNumber}
                  />
                )}
              </div>
            )}

            {/* Status Timeline */}
            <OrderTimeline order={order} />

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <IconX className="mr-2 h-4 w-4" />
                Tutup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
