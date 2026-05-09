"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/billing/billing-utils"
import type { PaymentMethodItem } from "@/types/reports"

const METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  card: "Kartu",
  insurance: "Asuransi",
}

const METHOD_COLORS: Record<string, string> = {
  cash: "#10b981",
  transfer: "#3b82f6",
  card: "#8b5cf6",
  insurance: "#f59e0b",
}

const chartConfig = { amount: { label: "Jumlah" } } satisfies ChartConfig

interface PaymentMethodChartProps {
  data: PaymentMethodItem[]
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const total = data.reduce((s, d) => s + d.amount, 0)
  const chartData = data.map((d) => ({
    ...d,
    label: METHOD_LABELS[d.paymentMethod] ?? d.paymentMethod,
    fill: METHOD_COLORS[d.paymentMethod] ?? "#94a3b8",
    pct: total > 0 ? Math.round((d.amount / total) * 100) : 0,
  }))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Metode Pembayaran</CardTitle>
        <CardDescription>Rincian metode pembayaran</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="text-muted-foreground flex h-[240px] items-center justify-center text-sm">
            Tidak ada data
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px] shrink-0">
              <PieChart>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const entry = payload[0].payload
                    return (
                      <div className="bg-background rounded-lg border p-3 shadow-md">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: entry.fill }}
                          />
                          <span className="text-xs font-medium">{entry.label}</span>
                        </div>
                        <p className="font-mono text-sm font-bold">
                          {formatCurrency(entry.amount)}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {entry.count} transaksi · {entry.pct}%
                        </p>
                      </div>
                    )
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="flex flex-1 flex-col gap-2">
              {chartData.map((entry) => (
                <div key={entry.paymentMethod} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: entry.fill }}
                    />
                    <span className="text-muted-foreground truncate text-xs">{entry.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold">{entry.pct}%</span>
                  </div>
                </div>
              ))}
              {total > 0 && (
                <div className="mt-1 border-t pt-2">
                  <p className="text-muted-foreground text-[10px]">Total</p>
                  <p className="font-mono text-sm font-bold">{formatCurrency(total)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
