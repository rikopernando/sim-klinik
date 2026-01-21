/**
 * List Widget Component (H.3.1)
 * Display lists of items with optional actions
 */

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { DashboardWidget } from "../dashboard-widget"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface ListWidgetItem {
  id: string | number
  title: string
  subtitle?: string
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ListWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  items: ListWidgetItem[]
  emptyMessage?: string
  maxHeight?: string
  headerAction?: ReactNode
  className?: string
  onItemClick?: (item: ListWidgetItem) => void
}

export function ListWidget({
  title,
  description,
  icon,
  items,
  emptyMessage = "Tidak ada data",
  maxHeight = "300px",
  headerAction,
  className,
  onItemClick,
}: ListWidgetProps) {
  return (
    <DashboardWidget
      title={title}
      description={description}
      icon={icon}
      headerAction={headerAction}
      className={className}
    >
      {items.length === 0 ? (
        <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-2">
            {items.map((item) => {
              const ItemIcon = item.icon
              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-card hover:bg-accent flex items-center justify-between rounded-md border p-3 transition-colors",
                    onItemClick && "cursor-pointer"
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {ItemIcon && (
                      <ItemIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-muted-foreground truncate text-xs">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium",
                          item.badge.variant === "destructive" &&
                            "bg-destructive text-destructive-foreground",
                          item.badge.variant === "secondary" &&
                            "bg-secondary text-secondary-foreground",
                          item.badge.variant === "outline" && "bg-background border",
                          !item.badge.variant && "bg-primary text-primary-foreground"
                        )}
                      >
                        {item.badge.label}
                      </span>
                    )}
                    {item.action && (
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          item.action?.onClick()
                        }}
                      >
                        {item.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </DashboardWidget>
  )
}
