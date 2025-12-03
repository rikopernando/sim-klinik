/**
 * Chart Widget Component (H.3.1)
 * Placeholder for future chart integration (Recharts, Chart.js, etc.)
 */

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { DashboardWidget } from "../dashboard-widget"

export interface ChartWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  headerAction?: ReactNode
  className?: string
}

/**
 * Chart Widget wrapper for chart libraries
 *
 * Usage example with future chart library:
 * ```tsx
 * <ChartWidget title="Revenue Trend" icon={TrendingUp}>
 *   <LineChart data={data}>
 *     <Line dataKey="revenue" />
 *   </LineChart>
 * </ChartWidget>
 * ```
 */
export function ChartWidget({
  title,
  description,
  icon,
  children,
  headerAction,
  className,
}: ChartWidgetProps) {
  return (
    <DashboardWidget
      title={title}
      description={description}
      icon={icon}
      headerAction={headerAction}
      className={className}
    >
      <div className="w-full">{children}</div>
    </DashboardWidget>
  )
}
