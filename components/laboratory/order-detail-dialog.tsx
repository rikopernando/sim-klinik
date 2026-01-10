/**
 * Order Detail Dialog Component
 * Comprehensive view of lab order with results and timeline
 * Refactored for modularity, type safety, and performance
 */

"use client"

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
  IconPaperclip,
  IconDownload,
  IconPhoto,
  IconFile,
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
import { formatDistanceToNow, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ResultDisplay } from "./result-display"
import type { LabOrderWithRelations } from "@/types/lab"

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
        <Badge variant="default" className="bg-green-600">
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
        subtitle={`${format(new Date(order.orderedAt), "dd MMM yyyy, HH:mm", { locale: idLocale })} • ${order.orderedByUser.name}`}
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
          subtitle={`${format(new Date(order.result.enteredAt), "dd MMM yyyy, HH:mm", { locale: idLocale })} • ${order.result.enteredBy}`}
        />
      )}

      {order.result?.isVerified && order.result.verifiedAt && (
        <TimelineItem
          icon={<IconCheck className="h-4 w-4" />}
          title="Hasil Diverifikasi"
          subtitle={`${format(new Date(order.result.verifiedAt), "dd MMM yyyy, HH:mm", { locale: idLocale })} • ${order.result.verifiedBy || "Unknown"}`}
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
                      <Badge variant="secondary">{order.test?.department}</Badge>
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-muted-foreground text-xs">Diinput oleh</p>
                    <p className="flex items-center gap-1 font-medium">
                      <IconUser className="h-3 w-3" />
                      {order.result.enteredBy}
                    </p>
                    <p className="text-xs">
                      {format(new Date(order.result.enteredAt), "dd MMM yyyy, HH:mm", {
                        locale: idLocale,
                      })}
                    </p>
                  </div>

                  {order.result.isVerified && order.result.verifiedBy && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                      <p className="text-muted-foreground text-xs">Diverifikasi oleh</p>
                      <p className="flex items-center gap-1 font-medium">
                        <IconCheck className="h-3 w-3" />
                        {order.result.verifiedBy}
                      </p>
                      {order.result.verifiedAt && (
                        <p className="text-xs">
                          {format(new Date(order.result.verifiedAt), "dd MMM yyyy, HH:mm", {
                            locale: idLocale,
                          })}
                        </p>
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
                  <div className="rounded-md border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <IconPaperclip className="text-primary h-4 w-4" />
                      <p className="text-muted-foreground text-xs font-medium">Lampiran File</p>
                      <Badge variant="secondary" className="text-xs">
                        {order.result.attachmentType}
                      </Badge>
                    </div>

                    {/* Image Preview for JPEG/PNG */}
                    {(order.result.attachmentType === "JPEG" ||
                      order.result.attachmentType === "PNG") && (
                      <div className="mb-3 overflow-hidden rounded-md border">
                        <img
                          src={order.result.attachmentUrl}
                          alt="Lab result attachment"
                          className="h-auto w-full object-contain"
                          style={{ maxHeight: "400px" }}
                        />
                      </div>
                    )}

                    {/* File Icon for PDF/DICOM */}
                    {(order.result.attachmentType === "PDF" ||
                      order.result.attachmentType === "DICOM") && (
                      <div className="bg-muted/30 mb-3 flex items-center justify-center rounded-md border py-8">
                        <div className="text-muted-foreground text-center">
                          <IconFile className="mx-auto mb-2 h-12 w-12" />
                          <p className="text-sm font-medium">
                            {order.result.attachmentType} File
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Download/View Button */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(order.result!.attachmentUrl!, "_blank")}
                      >
                        <IconEye className="mr-2 h-4 w-4" />
                        Lihat File
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = order.result!.attachmentUrl!
                          link.download = `lab-result-${order.orderNumber}`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        <IconDownload className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
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
