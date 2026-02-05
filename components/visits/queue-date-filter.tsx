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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePickerField
        label="Tanggal"
        value={selectedDate}
        onChange={handleDateSelect}
        endMonth={new Date(currentYear, 12)}
      />
    </div>
  )
}
