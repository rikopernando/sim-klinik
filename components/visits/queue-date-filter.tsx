"use client"

import { useState } from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { DatePickerField } from "@/components/forms/date-picker-field"

interface QueueDateFilterProps {
  onDateChange: (
    date: string | undefined,
    dateFrom: string | undefined,
    dateTo: string | undefined
  ) => void
  className?: string
}

const currentYear = new Date().getFullYear() + 20

export function QueueDateFilter({ onDateChange, className }: QueueDateFilterProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    onDateChange(format(date, "yyyy-MM-dd"), undefined, undefined)
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground text-sm">Tanggal:</span>
      <DatePickerField
        value={selectedDate}
        onChange={handleDateSelect}
        endMonth={new Date(currentYear, 12)}
        className="w-[160px]"
      />
      {isToday && (
        <span className="rounded-full bg-[#74c69d]/15 px-2 py-0.5 text-xs font-medium text-[#74c69d]">
          Hari ini
        </span>
      )}
    </div>
  )
}
