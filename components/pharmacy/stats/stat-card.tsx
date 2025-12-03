/**
 * Reusable Stat Card Component
 * Generic card for displaying statistics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    card: "",
    value: "",
    description: "text-muted-foreground",
  },
  danger: {
    card: "border-red-200 bg-red-50",
    value: "text-red-700",
    description: "text-red-600",
  },
  warning: {
    card: "border-orange-200 bg-orange-50",
    value: "text-orange-700",
    description: "text-orange-600",
  },
  caution: {
    card: "border-yellow-200 bg-yellow-50",
    value: "text-yellow-700",
    description: "text-yellow-600",
  },
}

export function StatCard({ title, value, description, variant = "default", icon }: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={styles.card}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${styles.value}`}>{value}</div>
        <p className={`text-xs ${styles.description}`}>{description}</p>
      </CardContent>
    </Card>
  )
}
