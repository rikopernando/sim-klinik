/**
 * Medical Record History List Filters Component
 * Filter controls for the medical record history list (used inside FilterDrawer)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { VISIT_TYPE_OPTIONS, LOCKED_STATUS_OPTIONS } from "@/types/medical-record"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"

interface HistoryListFiltersProps {
  visitType: string
  isLocked: string
  dateFrom: string
  dateTo: string
  onVisitTypeChange: (value: string) => void
  onIsLockedChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function HistoryListFilters({
  visitType,
  isLocked,
  dateFrom,
  dateTo,
  onVisitTypeChange,
  onIsLockedChange,
  onDateFromChange,
  onDateToChange,
}: HistoryListFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Visit Type Filter */}
      <div className="space-y-2">
        <Label>Tipe Kunjungan</Label>
        <Select value={visitType} onValueChange={onVisitTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe kunjungan" />
          </SelectTrigger>
          <SelectContent>
            {VISIT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locked Status Filter */}
      <div className="space-y-2">
        <Label>Status Kunci</Label>
        <Select value={isLocked} onValueChange={onIsLockedChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih status kunci" />
          </SelectTrigger>
          <SelectContent>
            {LOCKED_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          label="Dari Tanggal"
          placeholder="Pilih tanggal"
          value={dateFrom ? new Date(dateFrom) : undefined}
          onChange={(date) => onDateFromChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
        <DatePickerField
          label="Sampai Tanggal"
          placeholder="Pilih tanggal"
          value={dateTo ? new Date(dateTo) : undefined}
          onChange={(date) => onDateToChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
      </div>
    </div>
  )
}
