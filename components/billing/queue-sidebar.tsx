/**
 * Queue Sidebar Component
 * Displays the billing queue with selectable patient items and search functionality
 */

import { RefreshCw, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { getPaymentStatusConfig } from "@/lib/billing/billing-utils"
import { useQueueSearch } from "@/hooks/use-queue-search"
import type { BillingQueueItem } from "@/types/billing"

interface QueueSidebarProps {
  queue: BillingQueueItem[]
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
  // Search functionality
  const { searchQuery, setSearchQuery, filteredQueue, resultCount } = useQueueSearch(queue)

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
        <p className="text-muted-foreground text-xs">
          {searchQuery
            ? `${resultCount} dari ${queue.length} pasien`
            : `${queue.length} pasien menunggu pembayaran`}
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari nama, No. RM, No. kunjungan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Queue List */}
      <ScrollArea className="flex-1">
        {isLoading && queue.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">Memuat antrian...</div>
        ) : filteredQueue.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">
            {searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada pasien dalam antrian"}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredQueue.map((item) => (
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
  item: BillingQueueItem
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
          <Badge>
            {item.visit.visitType === "outpatient"
              ? "Rawat Jalan"
              : item.visit.visitType === "inpatient"
                ? "Rawat Inap"
                : "UGD"}
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
