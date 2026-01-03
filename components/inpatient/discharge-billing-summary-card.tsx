/**
 * Discharge Billing Summary Card
 * Displays aggregated billing breakdown for inpatient discharge
 */

"use client"

import { memo } from "react"
import {
  IconReceipt,
  IconBed,
  IconPill,
  IconFirstAidKit,
  IconStethoscope,
} from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DischargeBillingSummary } from "@/types/billing"
import { formatCurrency } from "@/lib/billing/billing-utils"

interface DischargeBillingSummaryCardProps {
  summary: DischargeBillingSummary | null
  isLoading: boolean
}

// Memoized loading state
const LoadingState = memo(function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  )
})

// Memoized empty state
const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-muted-foreground py-12 text-center">
      <IconReceipt className="mx-auto mb-4 h-12 w-12 opacity-40" />
      <p className="text-sm">Belum ada data tagihan discharge</p>
      <p className="text-muted-foreground text-xs">
        Klik tombol di atas untuk melihat ringkasan tagihan
      </p>
    </div>
  )
})

// Memoized breakdown item
const BreakdownItem = memo(function BreakdownItem({
  icon: Icon,
  label,
  amount,
  count,
  colorClass,
}: {
  icon: typeof IconBed
  label: string
  amount: string
  count: number
  colorClass: string
}) {
  return (
    <div className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground text-xs">{count} item</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(parseFloat(amount))}</p>
      </div>
    </div>
  )
})

export const DischargeBillingSummaryCard = memo(function DischargeBillingSummaryCard({
  summary,
  isLoading,
}: DischargeBillingSummaryCardProps) {
  if (isLoading) {
    return <LoadingState />
  }

  if (!summary) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Room Charges */}
      {parseFloat(summary.breakdown.roomCharges.amount) > 0 && (
        <BreakdownItem
          icon={IconBed}
          label={summary.breakdown.roomCharges.label}
          amount={summary.breakdown.roomCharges.amount}
          count={summary.breakdown.roomCharges.count}
          colorClass="bg-blue-500"
        />
      )}

      {/* Material Charges */}
      {parseFloat(summary.breakdown.materialCharges.amount) > 0 && (
        <BreakdownItem
          icon={IconFirstAidKit}
          label={summary.breakdown.materialCharges.label}
          amount={summary.breakdown.materialCharges.amount}
          count={summary.breakdown.materialCharges.count}
          colorClass="bg-green-500"
        />
      )}

      {/* Medication Charges */}
      {parseFloat(summary.breakdown.medicationCharges.amount) > 0 && (
        <BreakdownItem
          icon={IconPill}
          label={summary.breakdown.medicationCharges.label}
          amount={summary.breakdown.medicationCharges.amount}
          count={summary.breakdown.medicationCharges.count}
          colorClass="bg-purple-500"
        />
      )}

      {/* Procedure Charges */}
      {parseFloat(summary.breakdown.procedureCharges.amount) > 0 && (
        <BreakdownItem
          icon={IconStethoscope}
          label={summary.breakdown.procedureCharges.label}
          amount={summary.breakdown.procedureCharges.amount}
          count={summary.breakdown.procedureCharges.count}
          colorClass="bg-orange-500"
        />
      )}

      {/* Service Charges */}
      {parseFloat(summary.breakdown.serviceCharges.amount) > 0 && (
        <BreakdownItem
          icon={IconReceipt}
          label={summary.breakdown.serviceCharges.label}
          amount={summary.breakdown.serviceCharges.amount}
          count={summary.breakdown.serviceCharges.count}
          colorClass="bg-pink-500"
        />
      )}

      {/* Total */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Tagihan</p>
              <p className="text-muted-foreground text-xs">{summary.totalItems} item total</p>
            </div>
            <div className="text-right">
              <p className="text-primary text-2xl font-bold">
                {formatCurrency(parseFloat(summary.subtotal))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
