import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

interface StatCardProps {
  title: string
  value: number
  description: string
  variant?: "default" | "danger" | "warning" | "caution"
  icon?: ReactNode
}

const variantStyles = {
  default: {
    panel: "bg-card border",
    iconBg: "bg-muted text-muted-foreground",
    value: "text-foreground",
    description: "text-muted-foreground",
  },
  danger: {
    panel: "border-red-200 bg-red-50",
    iconBg: "bg-red-100 text-red-600",
    value: "text-red-700",
    description: "text-red-500",
  },
  warning: {
    panel: "border-orange-200 bg-orange-50",
    iconBg: "bg-orange-100 text-orange-600",
    value: "text-orange-700",
    description: "text-orange-500",
  },
  caution: {
    panel: "border-yellow-200 bg-yellow-50",
    iconBg: "bg-yellow-100 text-yellow-600",
    value: "text-yellow-700",
    description: "text-yellow-600",
  },
}

export function StatCard({ title, value, description, variant = "default", icon }: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm",
        styles.panel
      )}
    >
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-sm font-medium">{title}</p>
        <p className={cn("mt-0.5 text-2xl font-bold tabular-nums", styles.value)}>{value}</p>
        <p className={cn("mt-0.5 text-xs", styles.description)}>{description}</p>
      </div>
      {icon && <div className={cn("shrink-0 rounded-lg p-2", styles.iconBg)}>{icon}</div>}
    </div>
  )
}
