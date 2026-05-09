"use client"

import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { RefreshCw, Download, FileText, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { PeriodPreset } from "@/types/reports"

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu ini" },
  { value: "month", label: "Bulan ini" },
  { value: "3months", label: "3 Bulan Terakhir" },
  { value: "year", label: "Tahun ini" },
  { value: "custom", label: "Pilih Tanggal" },
]

interface ReportHeaderProps {
  preset: PeriodPreset
  dateFrom: string
  dateTo: string
  isLoading: boolean
  onPresetChange: (p: PeriodPreset) => void
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onRefresh: () => void
  onExport: () => void
}

export function ReportHeader({
  preset,
  dateFrom,
  dateTo,
  isLoading,
  onPresetChange,
  onDateFromChange,
  onDateToChange,
  onRefresh,
  onExport,
}: ReportHeaderProps) {
  const dateFromObj = dateFrom ? parseISO(dateFrom) : undefined
  const dateToObj = dateTo ? parseISO(dateTo) : undefined

  return (
    <div className="space-y-5">
      {/* Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h1>
            <p className="text-muted-foreground text-sm">
              Ringkasan pendapatan dan transaksi klinik
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={onExport} disabled={isLoading}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period segmented control */}
      <div className="flex flex-col gap-3">
        <div className="bg-muted/40 inline-flex rounded-lg border p-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPresetChange(p.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                preset === p.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm whitespace-nowrap">Dari</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-40 justify-start text-left font-normal",
                      !dateFromObj && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateFromObj
                      ? format(dateFromObj, "dd MMM yyyy", { locale: id })
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFromObj}
                    onSelect={(d) => d && onDateFromChange(format(d, "yyyy-MM-dd"))}
                    captionLayout="dropdown"
                    disabled={(d) => d > new Date() || (dateToObj ? d > dateToObj : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground text-sm whitespace-nowrap">Sampai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-40 justify-start text-left font-normal",
                      !dateToObj && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateToObj ? format(dateToObj, "dd MMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateToObj}
                    onSelect={(d) => d && onDateToChange(format(d, "yyyy-MM-dd"))}
                    captionLayout="dropdown"
                    disabled={(d) => d > new Date() || (dateFromObj ? d < dateFromObj : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
