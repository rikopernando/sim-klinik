import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DatePickerFieldProps {
  label?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  required?: boolean
  error?: string
  placeholder?: string
  endMonth?: Date
  startMonth?: Date
  disabled?: boolean
  dateFormat?: string
}

export function DatePickerField({
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  placeholder = "Pilih tanggal",
  startMonth = new Date("1900-01-01"),
  dateFormat = "dd MMMM yyyy",
  endMonth,
}: DatePickerFieldProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const onSelect = (date: Date | undefined) => {
    onChange(date)
    setCalendarOpen(false)
  }

  return (
    <FormField label={label} required={required} error={error}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, dateFormat) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            disabled={disabled}
            mode="single"
            selected={value}
            onSelect={onSelect}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
          />
        </PopoverContent>
      </Popover>
    </FormField>
  )
}
