/**
 * Queue Sidebar Component
 * Displays the billing queue with selectable patient items
 */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPaymentStatusConfig } from "@/lib/billing/billing-utils"
import type { PaymentStatus } from "@/types/billing"
import { RefreshCw } from "lucide-react"

interface QueueItem {
  visit: {
    id: string
    visitNumber: string
    visitType: string
  }
  patient: {
    name: string
    mrNumber: string
  }
  billing: {
    totalAmount: string
    paymentStatus: PaymentStatus
  } | null
}

interface QueueSidebarProps {
  queue: QueueItem[]
  isLoading: boolean
  selectedVisitId: string | null
  onSelectVisit: (visitId: string) => void
  onRefresh: () => void
}

export function QueueSidebar({
  queue,
  isLoading,
  selectedVisitId,
  onSelectVisit,
  onRefresh,
}: QueueSidebarProps) {
  return (
    <div className="bg-muted/30 flex w-96 flex-col border-r">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Antrian Pembayaran</h2>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">{queue.length} pasien menunggu pembayaran</p>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1">
        {isLoading && queue.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">Memuat antrian...</div>
        ) : queue.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">
            Tidak ada pasien dalam antrian
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {queue.map((item) => (
              <QueueItemCard
                key={item.visit.id}
                item={item}
                isSelected={selectedVisitId === item.visit.id}
                onSelect={() => onSelectVisit(item.visit.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

interface QueueItemCardProps {
  item: QueueItem
  isSelected: boolean
  onSelect: () => void
}

function QueueItemCard({ item, isSelected, onSelect }: QueueItemCardProps) {
  const paymentStatus = item.billing?.paymentStatus || "pending"
  const statusConfig = getPaymentStatusConfig(paymentStatus)

  return (
    <Card
      className={`cursor-pointer py-0 transition-all hover:shadow-md ${
        isSelected ? "ring-primary bg-primary/5 ring-2" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Patient Info */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">{item.patient.name}</p>
            <p className="text-muted-foreground text-xs">{item.patient.mrNumber}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.visit.visitType}
          </Badge>
        </div>

        {/* Visit & Billing Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">No. Kunjungan</span>
            <span className="font-mono">{item.visit.visitNumber}</span>
          </div>

          {item.billing && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                  Rp {parseFloat(item.billing.totalAmount).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusConfig.bgColor} ${statusConfig.color} border-0`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
