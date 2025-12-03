/**
 * Stat Widget Component (H.3.1)
 * Display key metrics and statistics
 */

import { LucideIcon } from "lucide-react"
import { DashboardWidget } from "../dashboard-widget"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface StatWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  className?: string
}

export function StatWidget({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  badge,
  className,
}: StatWidgetProps) {
  return (
    <DashboardWidget
      title={title}
      icon={icon}
      iconColor={iconColor}
      variant="compact"
      className={className}
    >
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{value}</p>
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            <span>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}
