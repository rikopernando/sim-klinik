/**
 * Lab Date Filter Component
 * Date picker for filtering lab orders by date
 */

"use client"

import { useState } from "react"
import { format, startOfDay } from "date-fns"
import { IconCalendarEvent } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { Button } from "@/components/ui/button"

interface LabDateFilterProps {
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void
  className?: string
  initialDate?: Date
}

const currentYear = new Date().getFullYear() + 20

export function LabDateFilter({ onDateChange, className, initialDate }: LabDateFilterProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || startOfDay(new Date()))

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const normalizedDate = startOfDay(date)
    setSelectedDate(normalizedDate)
    onDateChange(normalizedDate, normalizedDate)
  }

  const handleTodayClick = () => {
    const today = startOfDay(new Date())
    setSelectedDate(today)
    onDateChange(today, today)
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <DatePickerField
        label="Tanggal"
        value={selectedDate}
        onChange={handleDateSelect}
        endMonth={new Date(currentYear, 12)}
      />
      {!isToday && (
        <Button variant="outline" size="sm" onClick={handleTodayClick}>
          <IconCalendarEvent className="mr-1 h-4 w-4" />
          Hari Ini
        </Button>
      )}
    </div>
  )
}
