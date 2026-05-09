"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { VisitTypeItem } from "@/types/reports"

const VISIT_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

const VISIT_COLORS: Record<string, string> = {
  outpatient: "#3b82f6",
  inpatient: "#8b5cf6",
  emergency: "#ef4444",
}

const chartConfig = { revenue: { label: "Pendapatan" } } satisfies ChartConfig

interface VisitTypeChartProps {
  data: VisitTypeItem[]
}

export function VisitTypeChart({ data }: VisitTypeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: VISIT_LABELS[d.visitType] ?? d.visitType,
    fill: VISIT_COLORS[d.visitType] ?? "#94a3b8",
  }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Per Jenis Kunjungan</CardTitle>
        <CardDescription>Pendapatan Rawat Jalan, Rawat Inap, dan UGD</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-[180px] items-center justify-center text-sm">
            Tidak ada data
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
            <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
                  return String(v)
                }}
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
                      <p className="text-muted-foreground text-[11px]">{entry.count} kunjungan</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={56}>
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
