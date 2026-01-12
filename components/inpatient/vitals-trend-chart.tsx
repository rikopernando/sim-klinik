/**
 * Vitals Trend Chart Component
 * Displays vital signs trends over time using recharts
 */

"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { IconActivity } from "@tabler/icons-react"
import { id as localeId } from "date-fns/locale"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VitalSigns } from "@/types/inpatient"
import { formatDateTime } from "@/lib/utils/date"

interface VitalsTrendChartProps {
  vitals: VitalSigns[]
}

type DateRange = "24h" | "3d" | "7d" | "all"

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "24 Jam" },
  { value: "3d", label: "3 Hari" },
  { value: "7d", label: "7 Hari" },
  { value: "all", label: "Semua" },
]

// Normal ranges for vital signs
const NORMAL_RANGES = {
  temperature: { min: 36.1, max: 37.2 },
  systolicBP: { min: 90, max: 120 },
  diastolicBP: { min: 60, max: 80 },
  pulse: { min: 60, max: 100 },
  respiratoryRate: { min: 12, max: 20 },
  oxygenSaturation: { min: 95, max: 100 },
}

export function VitalsTrendChart({ vitals }: VitalsTrendChartProps) {
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [activeMetric, setActiveMetric] = useState<
    "temperature" | "bp" | "pulse" | "rr" | "spo2" | "all"
  >("all")

  // Filter data by date range
  const filteredData = useMemo(() => {
    const now = new Date()
    const sortedVitals = [...vitals].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )

    if (dateRange === "all") {
      return sortedVitals
    }

    const rangeMs = {
      "24h": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    }[dateRange]

    const cutoffTime = now.getTime() - rangeMs
    return sortedVitals.filter((vital) => new Date(vital.recordedAt).getTime() >= cutoffTime)
  }, [vitals, dateRange])

  // Transform data for recharts
  const chartData = useMemo(() => {
    return filteredData.map((vital) => ({
      timestamp: format(new Date(vital.recordedAt), "dd/MM HH:mm", { locale: localeId }),
      fullTimestamp: vital.recordedAt,
      temperature: vital.temperature,
      systolicBP: vital.bloodPressureSystolic,
      diastolicBP: vital.bloodPressureDiastolic,
      pulse: vital.pulse,
      respiratoryRate: vital.respiratoryRate,
      oxygenSaturation: vital.oxygenSaturation,
    }))
  }, [filteredData])

  if (vitals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Tren Vital Signs
          </CardTitle>
          <CardDescription>Belum ada data vital signs yang tercatat</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const renderChart = () => {
    if (activeMetric === "temperature") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[35, 40]} label={{ value: "°C", angle: -90, position: "insideLeft" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(payload[0].payload.fullTimestamp), "dd MMM yyyy, HH:mm", {
                          locale: localeId,
                        })}
                      </p>
                      <p className="text-sm font-semibold">Suhu: {payload[0].value}°C</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.temperature.min}
              y2={NORMAL_RANGES.temperature.max}
              fill="#22c55e"
              fillOpacity={0.1}
              label={{ value: "Normal", position: "top" }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={2}
              name="Suhu Tubuh (°C)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "bp") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
            <YAxis
              domain={[40, 180]}
              label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(payload[0].payload.fullTimestamp)}
                      </p>
                      <p className="text-sm font-semibold">Sistolik: {payload[0].value} mmHg</p>
                      <p className="text-sm font-semibold">Diastolik: {payload[1].value} mmHg</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.systolicBP.min}
              y2={NORMAL_RANGES.systolicBP.max}
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="systolicBP"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Sistolik (mmHg)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="diastolicBP"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Diastolik (mmHg)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "pulse") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
            <YAxis
              domain={[40, 140]}
              label={{ value: "bpm", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(payload[0].payload.fullTimestamp)}
                      </p>
                      <p className="text-sm font-semibold">Nadi: {payload[0].value} bpm</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.pulse.min}
              y2={NORMAL_RANGES.pulse.max}
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="pulse"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Nadi (bpm)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "rr") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
            <YAxis
              domain={[8, 30]}
              label={{ value: "x/min", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(payload[0].payload.fullTimestamp)}
                      </p>
                      <p className="text-sm font-semibold">Pernapasan: {payload[0].value} x/min</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.respiratoryRate.min}
              y2={NORMAL_RANGES.respiratoryRate.max}
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="respiratoryRate"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Pernapasan (x/min)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "spo2") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[85, 100]} label={{ value: "%", angle: -90, position: "insideLeft" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background rounded-lg border p-2 shadow-sm">
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(payload[0].payload.fullTimestamp)}
                      </p>
                      <p className="text-sm font-semibold">SpO2: {payload[0].value}%</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.oxygenSaturation.min}
              y2={NORMAL_RANGES.oxygenSaturation.max}
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="oxygenSaturation"
              stroke="#10b981"
              strokeWidth={2}
              name="SpO2 (%)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // All metrics in one chart
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background rounded-lg border p-3 shadow-sm">
                    <p className="text-muted-foreground mb-2 text-xs">
                      {formatDateTime(payload[0].payload.fullTimestamp)}
                    </p>
                    {data.temperature && <p className="text-xs">Suhu: {data.temperature}°C</p>}
                    {data.systolicBP && data.diastolicBP && (
                      <p className="text-xs">
                        TD: {data.systolicBP}/{data.diastolicBP} mmHg
                      </p>
                    )}
                    {data.pulse && <p className="text-xs">Nadi: {data.pulse} bpm</p>}
                    {data.respiratoryRate && (
                      <p className="text-xs">RR: {data.respiratoryRate} x/min</p>
                    )}
                    {data.oxygenSaturation && (
                      <p className="text-xs">SpO2: {data.oxygenSaturation}%</p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="pulse"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Nadi"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="systolicBP"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Sistolik"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="oxygenSaturation"
            stroke="#10b981"
            strokeWidth={2}
            name="SpO2"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="#ef4444"
            strokeWidth={2}
            name="Suhu"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="h-5 w-5" />
              Tren Vital Signs
            </CardTitle>
            <CardDescription>
              Grafik perkembangan vital signs ({filteredData.length} data poin)
            </CardDescription>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2 pt-4">
          {DATE_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant={activeMetric === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("all")}
          >
            Semua
          </Button>
          <Button
            variant={activeMetric === "temperature" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("temperature")}
          >
            Suhu
          </Button>
          <Button
            variant={activeMetric === "bp" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("bp")}
          >
            Tekanan Darah
          </Button>
          <Button
            variant={activeMetric === "pulse" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("pulse")}
          >
            Nadi
          </Button>
          <Button
            variant={activeMetric === "rr" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("rr")}
          >
            Pernapasan
          </Button>
          <Button
            variant={activeMetric === "spo2" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMetric("spo2")}
          >
            SpO2
          </Button>
        </div>
      </CardHeader>

      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
