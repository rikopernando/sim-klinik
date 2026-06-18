"use client"

import { CreditCard, RefreshCw } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { BillingDetails } from "@/types/billing"

interface BillingItemsPanelProps {
  billingDetails: BillingDetails | null
  isLoading: boolean
}

const ITEM_TYPE_CONFIG: Record<string, { dotClass: string }> = {
  service: { dotClass: "bg-sky-400" },
  drug: { dotClass: "bg-emerald-400" },
  material: { dotClass: "bg-orange-400" },
  room: { dotClass: "bg-slate-400" },
  laboratory: { dotClass: "bg-amber-400" },
}

export function BillingItemsPanel({ billingDetails, isLoading }: BillingItemsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <RefreshCw size={22} className="text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Memuat detail tagihan...</p>
      </div>
    )
  }

  if (!billingDetails) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
          <CreditCard size={28} className="text-primary/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Pilih pasien dari antrian</p>
          <p className="text-muted-foreground text-xs">untuk melihat rincian tagihan</p>
        </div>
      </div>
    )
  }

  if (billingDetails.items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-sm">Tidak ada item tagihan</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Column header — hidden on mobile */}
      <div className="bg-muted/40 hidden shrink-0 items-center justify-between px-5 py-1.5 sm:flex">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Item
        </span>
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Qty × Satuan
          </span>
          <span className="text-muted-foreground w-24 text-right text-[11px] font-semibold tracking-wider uppercase">
            Total
          </span>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="divide-border/60 divide-y">
            {billingDetails.items.map((item) => {
              const typeConfig = ITEM_TYPE_CONFIG[item.itemType] ?? {
                dotClass: "bg-muted-foreground/30",
              }
              return (
                <div key={item.id} className="flex items-start gap-2 px-5 py-3">
                  <div
                    className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", typeConfig.dotClass)}
                  />
                  {/* Mobile: stacked layout — name + total on top row, qty × price below */}
                  <div className="min-w-0 flex-1 sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm leading-snug font-medium">{item.itemName}</p>
                        {item.itemCode && (
                          <p className="text-muted-foreground font-mono text-xs">{item.itemCode}</p>
                        )}
                      </div>
                      <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs tabular-nums">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  {/* Desktop: horizontal layout */}
                  <div className="hidden min-w-0 flex-1 items-start justify-between gap-4 sm:flex">
                    <div className="min-w-0">
                      <p className="text-sm leading-snug font-medium">{item.itemName}</p>
                      {item.itemCode && (
                        <p className="text-muted-foreground font-mono text-xs">{item.itemCode}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-6 text-right">
                      <p className="text-muted-foreground font-mono text-xs tabular-nums">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="w-24 text-right font-mono text-sm font-semibold tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
