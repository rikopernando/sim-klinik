"use client"

import { RefreshCw, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchInput } from "@/components/ui/search-input"
import { getPaymentStatusConfig, getVisitTypeConfig } from "@/lib/billing/billing-utils"
import { useQueueSearch } from "@/hooks/use-queue-search"
import { cn } from "@/lib/utils"
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
  const {
    searchQuery,
    setSearchQuery,
    visitTypeFilter,
    setVisitTypeFilter,
    filteredQueue,
    resultCount,
  } = useQueueSearch(queue)

  return (
    <div className="bg-muted/20 flex h-full min-h-0 w-full flex-col border-r">
      {/* Fixed header */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
            Antrian Pembayaran
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
        <p className="text-muted-foreground mb-3 text-xs">
          {searchQuery
            ? `${resultCount} dari ${queue.length} pasien`
            : `${queue.length} pasien menunggu`}
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["all", "outpatient", "inpatient", "emergency"] as const).map((type) => {
            const labels = {
              all: "Semua",
              outpatient: "Rajal",
              inpatient: "Ranap",
              emergency: "UGD",
            }
            return (
              <Chip
                key={type}
                variant={visitTypeFilter === type ? "active" : "default"}
                onClick={() => setVisitTypeFilter(type)}
              >
                {labels[type]}
              </Chip>
            )
          })}
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari nama, No. RM..."
        />
      </div>

      {/* Scrollable queue list */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading && queue.length === 0 ? (
            <div className="space-y-1.5 px-2 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border px-3 py-3">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-12 animate-pulse rounded-full" />
                  </div>
                  <div className="bg-muted mb-2 h-3 w-40 animate-pulse rounded" />
                  <div className="flex items-center justify-between">
                    <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-14 animate-pulse rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Users size={32} className="text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada pasien dalam antrian"}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 px-2 py-2">
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
  const visitConfig = getVisitTypeConfig(item.visit.visitType)

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border/60 bg-card hover:bg-muted/40 hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Name + visit type */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-sm leading-tight font-semibold">{item.patient.name}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            visitConfig.className
          )}
        >
          {visitConfig.label}
        </span>
      </div>

      {/* MR + visit number */}
      <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
        <span>{item.patient.mrNumber}</span>
        <span>·</span>
        <span className="font-mono">{item.visit.visitNumber}</span>
      </div>

      {/* Total + payment status */}
      {item.billing && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold">
            Rp {parseFloat(item.billing.totalAmount).toLocaleString("id-ID")}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        </div>
      )}
    </button>
  )
}
