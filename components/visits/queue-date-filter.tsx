"use client"

import { useState } from "react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type DatePreset = "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "custom"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface QueueDateFilterProps {
  onDateChange: (date: string | undefined, dateFrom: string | undefined, dateTo: string | undefined) => void
  className?: string
}

export function QueueDateFilter({ onDateChange, className }: QueueDateFilterProps) {
  const [preset, setPreset] = useState<DatePreset>("today")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handlePresetChange = (value: DatePreset) => {
    setPreset(value)
    const today = new Date()

    switch (value) {
      case "today":
        onDateChange(format(today, "yyyy-MM-dd"), undefined, undefined)
        setDateRange({ from: today, to: today })
        break
      case "yesterday":
        const yesterday = subDays(today, 1)
        onDateChange(format(yesterday, "yyyy-MM-dd"), undefined, undefined)
        setDateRange({ from: yesterday, to: yesterday })
        break
      case "this_week":
        const weekStart = startOfWeek(today, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
        onDateChange(undefined, format(weekStart, "yyyy-MM-dd"), format(weekEnd, "yyyy-MM-dd"))
        setDateRange({ from: weekStart, to: weekEnd })
        break
      case "last_week":
        const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
        const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 })
        onDateChange(undefined, format(lastWeekStart, "yyyy-MM-dd"), format(lastWeekEnd, "yyyy-MM-dd"))
        setDateRange({ from: lastWeekStart, to: lastWeekEnd })
        break
      case "this_month":
        const monthStart = startOfMonth(today)
        const monthEnd = endOfMonth(today)
        onDateChange(undefined, format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd"))
        setDateRange({ from: monthStart, to: monthEnd })
        break
      case "custom":
        // Don't change dates, wait for calendar selection
        break
    }
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    if (!range) return

    setDateRange(range)

    if (range.from && range.to) {
      onDateChange(
        undefined,
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd")
      )
      setCalendarOpen(false)
    } else if (range.from) {
      // Single date selected
      onDateChange(format(range.from, "yyyy-MM-dd"), undefined, undefined)
    }
  }

  const getDisplayLabel = () => {
    if (preset === "today") return "Hari Ini"
    if (preset === "yesterday") return "Kemarin"
    if (preset === "this_week") return "Minggu Ini"
    if (preset === "last_week") return "Minggu Lalu"
    if (preset === "this_month") return "Bulan Ini"

    if (dateRange.from && dateRange.to) {
      if (format(dateRange.from, "yyyy-MM-dd") === format(dateRange.to, "yyyy-MM-dd")) {
        return format(dateRange.from, "d MMMM yyyy", { locale: id })
      }
      return `${format(dateRange.from, "d MMM", { locale: id })} - ${format(dateRange.to, "d MMM yyyy", { locale: id })}`
    }
    if (dateRange.from) {
      return format(dateRange.from, "d MMMM yyyy", { locale: id })
    }

    return "Pilih Tanggal"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as DatePreset)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Pilih periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hari Ini</SelectItem>
          <SelectItem value="yesterday">Kemarin</SelectItem>
          <SelectItem value="this_week">Minggu Ini</SelectItem>
          <SelectItem value="last_week">Minggu Lalu</SelectItem>
          <SelectItem value="this_month">Bulan Ini</SelectItem>
          <SelectItem value="custom">Kustom</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleCustomDateSelect}
              numberOfMonths={2}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      )}

      {preset !== "custom" && (
        <span className="text-muted-foreground text-sm">{getDisplayLabel()}</span>
      )}
    </div>
  )
}
