"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { DailyTrendItem } from "@/types/reports"

const chartConfig = {
  revenue: { label: "Pendapatan", color: "hsl(142 76% 36%)" },
} satisfies ChartConfig

interface RevenueTrendChartProps {
  data: DailyTrendItem[]
}

const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const average = avg(data.map((d) => d.revenue))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Tren Pendapatan Harian</CardTitle>
            <CardDescription className="mt-0.5">Pendapatan yang diterima per hari</CardDescription>
          </div>
          {average > 0 && (
            <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-right dark:bg-emerald-900/20">
              <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(average)}
              </p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">
                rata-rata/hari
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
            Tidak ada data pada periode ini
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <AreaChart data={data} margin={{ left: 0, right: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
                  return String(v)
                }}
              />
              {average > 0 && (
                <ReferenceLine
                  y={average}
                  stroke="hsl(142 76% 36%)"
                  strokeDasharray="4 3"
                  strokeOpacity={0.4}
                />
              )}
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  const entry = d.payload as DailyTrendItem
                  return (
                    <div className="bg-background rounded-lg border p-3 shadow-md">
                      <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                        {new Date(label).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(d.value))}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {entry.transactions} transaksi
                      </p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(142 76% 36%)"
                fill="url(#fillRevenue)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(142 76% 36%)", fill: "white" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
