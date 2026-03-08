"use client"

/**
 * ER Vitals Chart Component
 * Displays patient vital signs history as a timeline/chart
 * Used in ER medical record page for monitoring patient condition
 */

import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { TrendingUp, TrendingDown, Minus, Activity, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface VitalsRecord {
  id: string
  temperature: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  pulse: number | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  consciousness: string | null
  painScale: number | null
  recordedAt: string
  recordedBy: {
    name: string
  }
  notes: string | null
}

interface ERVitalsChartProps {
  visitId: string
  vitalsHistory: VitalsRecord[]
  isLoading?: boolean
}

/**
 * Get trend indicator comparing two values
 */
function getTrend(
  current: number | null,
  previous: number | null
): "up" | "down" | "stable" | null {
  if (current === null || previous === null) return null
  if (current > previous) return "up"
  if (current < previous) return "down"
  return "stable"
}

/**
 * Get trend icon and color
 */
function TrendIndicator({
  trend,
  isGoodUp = false,
}: {
  trend: "up" | "down" | "stable" | null
  isGoodUp?: boolean
}) {
  if (trend === null) return null

  if (trend === "up") {
    return <TrendingUp className={cn("h-4 w-4", isGoodUp ? "text-green-600" : "text-red-600")} />
  }
  if (trend === "down") {
    return <TrendingDown className={cn("h-4 w-4", !isGoodUp ? "text-green-600" : "text-red-600")} />
  }
  return <Minus className="h-4 w-4 text-gray-500" />
}

/**
 * Vital sign card with value and trend
 */
function VitalCard({
  label,
  value,
  unit,
  normalRange,
  trend,
  isGoodUp = false,
}: {
  label: string
  value: string | number | null
  unit: string
  normalRange?: string
  trend?: "up" | "down" | "stable" | null
  isGoodUp?: boolean
}) {
  const isAbnormal = value !== null && normalRange && isValueAbnormal(value, normalRange)

  return (
    <div className={cn("rounded-lg border p-3", isAbnormal && "border-red-300 bg-red-50")}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        {trend && <TrendIndicator trend={trend} isGoodUp={isGoodUp} />}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold", isAbnormal && "text-red-600")}>
          {value ?? "-"}
        </span>
        <span className="text-muted-foreground text-sm">{unit}</span>
      </div>
      {normalRange && <span className="text-muted-foreground text-xs">Normal: {normalRange}</span>}
    </div>
  )
}

/**
 * Check if value is outside normal range
 */
function isValueAbnormal(value: string | number, normalRange: string): boolean {
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numValue)) return false

  // Parse range like "36-37.5" or "60-100"
  const rangeMatch = normalRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1])
    const max = parseFloat(rangeMatch[2])
    return numValue < min || numValue > max
  }

  // Parse single value like ">95"
  const minMatch = normalRange.match(/>(\d+(?:\.\d+)?)/)
  if (minMatch) {
    return numValue < parseFloat(minMatch[1])
  }

  return false
}

export function ERVitalsChart({ vitalsHistory, isLoading }: ERVitalsChartProps) {
  const latestVitals = vitalsHistory[0]
  const previousVitals = vitalsHistory[1]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!latestVitals) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8" />
          <p>Belum ada data vital signs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Latest Vitals Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vital Signs Terkini</CardTitle>
              <CardDescription>
                Direkam:{" "}
                {format(new Date(latestVitals.recordedAt), "dd MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
                {" oleh "}
                {latestVitals.recordedBy.name}
              </CardDescription>
            </div>
            {latestVitals.consciousness && (
              <Badge variant={latestVitals.consciousness === "Alert" ? "default" : "destructive"}>
                {latestVitals.consciousness}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <VitalCard
              label="Suhu"
              value={latestVitals.temperature}
              unit="°C"
              normalRange="36-37.5"
              trend={getTrend(latestVitals.temperature, previousVitals?.temperature ?? null)}
            />
            <VitalCard
              label="Tekanan Darah"
              value={
                latestVitals.bloodPressureSystolic && latestVitals.bloodPressureDiastolic
                  ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`
                  : null
              }
              unit="mmHg"
              normalRange="90/60-120/80"
            />
            <VitalCard
              label="Nadi"
              value={latestVitals.pulse}
              unit="x/menit"
              normalRange="60-100"
              trend={getTrend(latestVitals.pulse, previousVitals?.pulse ?? null)}
            />
            <VitalCard
              label="Respirasi"
              value={latestVitals.respiratoryRate}
              unit="x/menit"
              normalRange="12-20"
              trend={getTrend(
                latestVitals.respiratoryRate,
                previousVitals?.respiratoryRate ?? null
              )}
            />
            <VitalCard
              label="SpO2"
              value={latestVitals.oxygenSaturation}
              unit="%"
              normalRange=">95"
              trend={getTrend(
                latestVitals.oxygenSaturation,
                previousVitals?.oxygenSaturation ?? null
              )}
              isGoodUp={true}
            />
            {latestVitals.painScale !== null && (
              <VitalCard
                label="Skala Nyeri"
                value={latestVitals.painScale}
                unit="/10"
                normalRange="0-3"
              />
            )}
          </div>
          {latestVitals.notes && (
            <div className="bg-muted mt-4 rounded-lg p-3">
              <p className="text-sm font-medium">Catatan:</p>
              <p className="text-muted-foreground text-sm">{latestVitals.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals History Timeline */}
      {vitalsHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Vital Signs</CardTitle>
            <CardDescription>Timeline perubahan vital signs pasien</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vitalsHistory.map((record, index) => (
                <div
                  key={record.id}
                  className={cn(
                    "flex gap-4 border-l-2 pb-4 pl-4",
                    index === 0 ? "border-primary" : "border-muted"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {format(new Date(record.recordedAt), "dd MMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}
                      </span>
                      <span className="text-muted-foreground">oleh {record.recordedBy.name}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      {record.temperature && (
                        <Badge variant="outline">Suhu: {record.temperature}°C</Badge>
                      )}
                      {record.bloodPressureSystolic && record.bloodPressureDiastolic && (
                        <Badge variant="outline">
                          TD: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                        </Badge>
                      )}
                      {record.pulse && <Badge variant="outline">Nadi: {record.pulse}</Badge>}
                      {record.oxygenSaturation && (
                        <Badge variant="outline">SpO2: {record.oxygenSaturation}%</Badge>
                      )}
                      {record.consciousness && (
                        <Badge variant="outline">GCS: {record.consciousness}</Badge>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-muted-foreground mt-2 text-sm">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
