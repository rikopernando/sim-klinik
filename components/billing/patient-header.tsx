import { format } from "date-fns"
import { id as dateLocale } from "date-fns/locale"

import { cn } from "@/lib/utils"
import type { BillingDetails } from "@/types/billing"

interface PatientHeaderProps {
  billingDetails: BillingDetails
  visitConfig: { label: string; className: string } | null
}

export function PatientHeader({ billingDetails, visitConfig }: PatientHeaderProps) {
  return (
    <div className="bg-muted/20 shrink-0 border-b px-5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{billingDetails.patient.name}</p>
            {visitConfig && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  visitConfig.className
                )}
              >
                {visitConfig.label}
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
            <span>{billingDetails.patient.mrNumber}</span>
            <span>·</span>
            <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
              {billingDetails.visit.visitNumber}
            </span>
            <span>·</span>
            <span>
              {format(new Date(billingDetails.visit.createdAt), "dd MMM yyyy", {
                locale: dateLocale,
              })}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-widest uppercase">
          {billingDetails.items.length} item
        </p>
      </div>
    </div>
  )
}
