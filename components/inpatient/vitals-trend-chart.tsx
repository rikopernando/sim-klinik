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
import { VitalSigns } from "@/types/inpatient"
import { formatDateTime } from "@/lib/utils/date"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VitalsTrendChartProps {
  vitals: VitalSigns[]
}

type DateRange = "24h" | "3d" | "7d" | "all"
type ActiveMetric = "bp" | "pulse" | "temperature" | "rr" | "spo2"

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "24 Jam" },
  { value: "3d", label: "3 Hari" },
  { value: "7d", label: "7 Hari" },
  { value: "all", label: "Semua" },
]

const METRIC_OPTIONS: { value: ActiveMetric; label: string }[] = [
  { value: "bp", label: "Tekanan Darah" },
  { value: "pulse", label: "Nadi" },
  { value: "temperature", label: "Suhu" },
  { value: "rr", label: "Pernapasan" },
  { value: "spo2", label: "SpO₂" },
]

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
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>("bp")

  const filteredData = useMemo(() => {
    const sorted = [...vitals].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    if (dateRange === "all") return sorted
    const rangeMs = { "24h": 86_400_000, "3d": 259_200_000, "7d": 604_800_000 }[dateRange]
    const cutoff = Date.now() - rangeMs
    return sorted.filter((v) => new Date(v.recordedAt).getTime() >= cutoff)
  }, [vitals, dateRange])

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
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <IconActivity className="text-muted-foreground/30 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Belum ada data vital signs yang tercatat</p>
      </div>
    )
  }

  const renderChart = () => {
    if (activeMetric === "temperature") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[35, 40]}
              label={{ value: "°C", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
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
              }}
            />
            <Legend />
            <ReferenceArea
              y1={NORMAL_RANGES.temperature.min}
              y2={NORMAL_RANGES.temperature.max}
              fill="#22c55e"
              fillOpacity={0.1}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={2}
              name="Suhu (°C)"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "bp") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[40, 180]}
              label={{ value: "mmHg", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border p-2 shadow-sm">
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(payload[0].payload.fullTimestamp)}
                    </p>
                    <p className="text-sm font-semibold">Sistolik: {payload[0].value} mmHg</p>
                    {payload[1] && (
                      <p className="text-sm font-semibold">Diastolik: {payload[1].value} mmHg</p>
                    )}
                  </div>
                )
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
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="diastolicBP"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Diastolik (mmHg)"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "pulse") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[40, 140]}
              label={{ value: "bpm", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border p-2 shadow-sm">
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(payload[0].payload.fullTimestamp)}
                    </p>
                    <p className="text-sm font-semibold">Nadi: {payload[0].value} bpm</p>
                  </div>
                )
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
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeMetric === "rr") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[8, 30]}
              label={{ value: "x/min", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-background rounded-lg border p-2 shadow-sm">
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(payload[0].payload.fullTimestamp)}
                    </p>
                    <p className="text-sm font-semibold">RR: {payload[0].value} x/min</p>
                  </div>
                )
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
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // spo2
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={[85, 100]}
            label={{ value: "%", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-background rounded-lg border p-2 shadow-sm">
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(payload[0].payload.fullTimestamp)}
                  </p>
                  <p className="text-sm font-semibold">SpO₂: {payload[0].value}%</p>
                </div>
              )
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
            name="SpO₂ (%)"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 space-y-2">
        {/* Metric selector */}
        <Tabs value={activeMetric} onValueChange={(v) => setActiveMetric(v as ActiveMetric)}>
          <TabsList className="flex h-auto w-fit justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {METRIC_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value} className="flex-none text-xs">
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Date range selector */}
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <TabsList className="flex h-auto w-fit justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value} className="flex-none text-xs">
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground text-sm">
            Tidak ada data untuk rentang waktu yang dipilih
          </p>
        </div>
      ) : (
        renderChart()
      )}
    </div>
  )
}
