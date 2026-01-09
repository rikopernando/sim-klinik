/**
 * Order Detail Dialog Component
 * Comprehensive view of lab order with results and timeline
 */

"use client"

import { useState, useEffect } from "react"
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
import { formatDistanceToNow, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface OrderDetailDialogProps {
  orderId: string
  trigger?: React.ReactNode
}

export function OrderDetailDialog({ orderId, trigger }: OrderDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const { order, loading, refetch } = useLabOrder({
    orderId,
    autoFetch: false,
  })

  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  const getStatusBadge = (status: string | null) => {
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
  }

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
                      {order.urgency && order.urgency !== "routine" && (
                        <Badge
                          variant={order.urgency === "stat" ? "destructive" : "default"}
                          className={order.urgency === "urgent" ? "bg-orange-500" : ""}
                        >
                          {order.urgency.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">{order.orderNumber}</p>
                  </div>
                  {getStatusBadge(order.status)}
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

                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs">Nilai Hasil</p>
                    {"value" in order.result.resultData ? (
                      <p className="text-2xl font-bold">
                        {order.result.resultData.value}
                        <span className="text-muted-foreground ml-2 text-base font-normal">
                          {order.result.resultData.unit}
                        </span>
                      </p>
                    ) : "findings" in order.result.resultData ? (
                      <div>
                        <p className="font-medium">{order.result.resultData.findings}</p>
                        {"interpretation" in order.result.resultData &&
                          order.result.resultData.interpretation && (
                            <p className="text-muted-foreground mt-2 text-sm">
                              <span className="font-medium">Interpretasi:</span>{" "}
                              {order.result.resultData.interpretation}
                            </p>
                          )}
                        {"impression" in order.result.resultData &&
                          order.result.resultData.impression && (
                            <p className="text-muted-foreground mt-2 text-sm">
                              <span className="font-medium">Kesan:</span>{" "}
                              {order.result.resultData.impression}
                            </p>
                          )}
                      </div>
                    ) : (
                      <p className="text-sm">Hasil tersedia</p>
                    )}
                  </div>
                </div>

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
              </div>
            )}

            {/* Status Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold">Timeline Order</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <IconClock className="text-muted-foreground mt-1 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order Dibuat</p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(order.orderedAt), "dd MMM yyyy, HH:mm", {
                        locale: idLocale,
                      })}{" "}
                      • {order.orderedByUser.name}
                    </p>
                  </div>
                </div>

                {order.status !== "ordered" && (
                  <div className="flex items-start gap-3">
                    <IconDroplet className="text-muted-foreground mt-1 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Spesimen Collected</p>
                      <p className="text-muted-foreground text-xs">Status updated</p>
                    </div>
                  </div>
                )}

                {order.result && (
                  <div className="flex items-start gap-3">
                    <IconFileText className="text-muted-foreground mt-1 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hasil Diinput</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(order.result.enteredAt), "dd MMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}{" "}
                        • {order.result.enteredBy}
                      </p>
                    </div>
                  </div>
                )}

                {order.result?.isVerified && order.result.verifiedAt && (
                  <div className="flex items-start gap-3">
                    <IconCheck className="text-muted-foreground mt-1 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hasil Diverifikasi</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(order.result.verifiedAt), "dd MMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}{" "}
                        • {order.result.verifiedBy || "Unknown"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
