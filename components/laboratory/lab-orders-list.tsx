/**
 * Lab Orders List Component
 * Displays list of lab orders for a specific visit
 */

"use client"

import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { IconFlask, IconClock, IconCheck, IconAlertCircle } from "@tabler/icons-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLabOrders } from "@/hooks/use-lab-orders"
import { formatCurrency } from "@/lib/utils/billing"

interface LabOrdersListProps {
  visitId: string
}

export function LabOrdersList({ visitId }: LabOrdersListProps) {
  const { orders, loading } = useLabOrders({
    initialFilters: { visitId },
    autoFetch: true,
  })

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

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="hover:bg-accent/50 p-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{order.test?.name || "Test Unknown"}</h4>
                <Badge
                  variant={order.test?.department === "LAB" ? "secondary" : "default"}
                  className="text-xs"
                >
                  {order.test?.department}
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
                  Ordered
                  {formatDistanceToNow(new Date(order.orderedAt), {
                    addSuffix: true,
                    locale: idLocale,
                  })}
                </span>
                <span>•</span>
                <span>oleh {order.orderedByUser.name}</span>
              </div>

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
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
