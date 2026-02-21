/**
 * Lab Orders List Component
 * Displays list of lab orders for a specific visit
 */

"use client"

import { useMemo, forwardRef, useImperativeHandle, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { toast } from "sonner"

import { IconFlask, IconClock, IconCheck, IconAlertCircle, IconX } from "@tabler/icons-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLabOrders } from "@/hooks/use-lab-orders"
import { updateLabOrderStatus } from "@/lib/services/lab.service"
import { formatCurrency } from "@/lib/utils/billing"
import { getErrorMessage } from "@/lib/utils/error"

import { OrderDetailDialog } from "./order-detail-dialog"
import LabBadge from "./lab-badge"

interface LabOrdersListProps {
  visitId: string
  showSubtotal?: boolean
}

export interface LabOrdersListRef {
  refetch: () => void
}

export const LabOrdersList = forwardRef<LabOrdersListRef, LabOrdersListProps>(
  function LabOrdersList({ visitId, showSubtotal }, ref) {
    const { orders, loading, refetch } = useLabOrders({
      initialFilters: { visitId },
      autoFetch: true,
      defaultToToday: false, // Show all orders for this visit, not just today
    })

    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState("")
    const [isCancelling, setIsCancelling] = useState(false)

    // Expose refetch to parent component
    useImperativeHandle(ref, () => ({
      refetch,
    }))

    const handleCancelOrder = async (orderId: string) => {
      if (!cancelReason.trim()) {
        toast.error("Alasan pembatalan harus diisi")
        return
      }

      setIsCancelling(true)
      try {
        await updateLabOrderStatus(orderId, {
          status: "cancelled",
          cancelledReason: cancelReason.trim(),
        })
        toast.success("Order berhasil dibatalkan")
        setCancellingOrderId(null)
        setCancelReason("")
        refetch()
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setIsCancelling(false)
      }
    }

    const subtotal = useMemo(() => {
      if (!showSubtotal) return 0
      return orders.reduce((total, order) => {
        if (order.price && order.status !== "cancelled" && order.status !== "rejected") {
          return total + parseFloat(order.price)
        }
        return total
      }, 0)
    }, [orders, showSubtotal])

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
            <Badge variant="outline">
              <IconCheck className="mr-1 h-3 w-3" />
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

    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <Card className="p-8 text-center">
          <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-muted-foreground text-sm">
            Belum ada order laboratorium untuk pasien ini
          </p>
        </Card>
      )
    }

    const renderOrderDetailDialog = (orderId: string) => {
      return <OrderDetailDialog orderId={orderId} />
    }

    const renderCancelButton = (orderId: string, orderNumber: string) => {
      return (
        <AlertDialog
          open={cancellingOrderId === orderId}
          onOpenChange={(open) => {
            if (!open) {
              setCancellingOrderId(null)
              setCancelReason("")
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setCancellingOrderId(orderId)}
            >
              <IconX className="mr-1 h-3 w-3" />
              Batalkan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan Order Lab?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan membatalkan order <strong>{orderNumber}</strong>. Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="cancelReason">Alasan Pembatalan *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Masukkan alasan pembatalan..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleCancelOrder(orderId)
                }}
                disabled={isCancelling || !cancelReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? "Membatalkan..." : "Ya, Batalkan Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    return (
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="hover:bg-accent/50 p-4 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{order.test?.name || "Test Unknown"}</h4>
                  <LabBadge departement={order.test?.department || "LAB"} />
                  {order.urgency && order.urgency !== "routine" && (
                    <Badge
                      variant={order.urgency === "stat" ? "destructive" : "default"}
                      className={order.urgency === "urgent" ? "bg-orange-500" : ""}
                    >
                      {order.urgency.toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs">{order.orderNumber}</span>
                  <span>•</span>
                  <span className="text-xs">{order.test?.code}</span>
                </div>

                {order.clinicalIndication && (
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    <span className="font-medium">Indikasi Klinis:</span> {order.clinicalIndication}
                  </p>
                )}

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>
                    Ordered{" "}
                    {formatDistanceToNow(new Date(order.orderedAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </span>
                  <span>•</span>
                  <span>oleh {order.orderedByUser.name}</span>
                </div>

                {order.cancelledReason && order.status === "cancelled" && (
                  <div className="border-t pt-2">
                    <p className="text-xs text-red-600">
                      <span className="font-medium">Alasan dibatalkan:</span>{" "}
                      {order.cancelledReason}
                    </p>
                  </div>
                )}

                {order.result && order.result.isVerified && (
                  <div className="border-t pt-2">
                    <p className="text-xs font-medium text-green-600">
                      ✓ Hasil tersedia dan telah diverifikasi
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-right">
                {getStatusBadge(order.status)}
                <p className="text-primary text-sm font-semibold">
                  {formatCurrency(parseFloat(order.price))}
                </p>
                {order.test?.tatHours && order.status === "ordered" && (
                  <p className="text-muted-foreground text-xs">TAT: {order.test.tatHours}h</p>
                )}
                <div className="flex items-center justify-end gap-1">
                  {order.status === "ordered" &&
                    renderCancelButton(order.id, order.orderNumber || "-")}
                  {renderOrderDetailDialog(order.id)}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {showSubtotal && (
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <span className="text-sm font-semibold">Subtotal Lab</span>
            <span className="text-primary text-lg font-bold">{formatCurrency(subtotal)}</span>
          </div>
        )}
      </div>
    )
  }
)
