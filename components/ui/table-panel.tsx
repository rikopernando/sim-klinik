import { Loader2 } from "lucide-react"

interface TablePanelProps {
  /** Panel header label (shown in uppercase) */
  label: string
  /** Total count shown as a badge. Hidden when undefined or 0. */
  total?: number
  /** Show a centered spinner instead of content (initial load with no items yet) */
  isLoading?: boolean
  loadingMessage?: string
  /** Show the empty state instead of content */
  isEmpty?: boolean
  emptyIcon?: React.ReactNode
  emptyTitle: string
  emptyDescription?: string
  /** Optional CTA rendered below the empty state description */
  emptyAction?: React.ReactNode
  /** Pagination footer — rendered only when provided */
  paginationRange?: string
  pagination?: React.ReactNode
  children: React.ReactNode
}

export function TablePanel({
  label,
  total,
  isLoading,
  loadingMessage = "Memuat data...",
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  paginationRange,
  pagination,
  children,
}: TablePanelProps) {
  if (isLoading) {
    return (
      <div className="bg-card flex items-center justify-center overflow-hidden rounded-xl border py-20 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 size={16} className="text-muted-foreground animate-spin" />
          <span className="text-muted-foreground">{loadingMessage}</span>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          {emptyIcon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#52b788]/10">
              {emptyIcon}
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">{emptyTitle}</p>
            {emptyDescription && (
              <p className="text-muted-foreground mt-1 text-xs">{emptyDescription}</p>
            )}
          </div>
          {emptyAction && <div className="mt-1">{emptyAction}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
          {label}
        </p>
        {!!total && (
          <span className="rounded-full bg-[#52b788]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2d6a4f] dark:text-[#74c69d]">
            {total.toLocaleString("id-ID")} total
          </span>
        )}
      </div>

      {children}

      {(paginationRange || pagination) && (
        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-muted-foreground text-xs tabular-nums">{paginationRange}</p>
          <div className="[&>div]:mt-0">{pagination}</div>
        </div>
      )}
    </div>
  )
}
