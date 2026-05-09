"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { ServiceTypeItem } from "@/types/reports"

const SERVICE_LABELS: Record<string, string> = {
  service: "Layanan",
  drug: "Obat",
  material: "Material",
  room: "Kamar",
  laboratory: "Lab",
}

const SERVICE_COLORS: Record<string, string> = {
  service: "#3b82f6",
  drug: "#10b981",
  material: "#f59e0b",
  room: "#8b5cf6",
  laboratory: "#0ea5e9",
}

const chartConfig = { revenue: { label: "Pendapatan" } } satisfies ChartConfig

interface ServiceTypeChartProps {
  data: ServiceTypeItem[]
}

export function ServiceTypeChart({ data }: ServiceTypeChartProps) {
  const total = data.reduce((s, d) => s + d.revenue, 0)
  const chartData = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .map((d) => ({
      ...d,
      label: SERVICE_LABELS[d.serviceType] ?? d.serviceType,
      fill: SERVICE_COLORS[d.serviceType] ?? "#94a3b8",
      pct: total > 0 ? Math.round((d.revenue / total) * 100) : 0,
    }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Per Jenis Item</CardTitle>
        <CardDescription>Rincian pendapatan per kategori</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
            Tidak ada data
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
                  return String(v)
                }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={55}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const entry = payload[0].payload
                  return (
                    <div className="bg-background rounded-lg border p-3 shadow-md">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: entry.fill }}
                        />
                        <span className="text-xs font-medium">{entry.label}</span>
                      </div>
                      <p className="font-mono text-sm font-bold">{formatCurrency(entry.revenue)}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {entry.count} item · {entry.pct}%
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
