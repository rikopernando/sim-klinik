/**
 * Visit History Filters Component
 * Filter controls for the visit history list (used inside FilterDrawer)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { VISIT_TYPE_OPTIONS, VISIT_STATUS_FILTER_OPTIONS } from "@/types/visit-history"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"

interface VisitHistoryFiltersProps {
  status: string
  visitType: string
  dateFrom: string
  dateTo: string
  onStatusChange: (value: string) => void
  onVisitTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function VisitHistoryFilters({
  status,
  visitType,
  dateFrom,
  dateTo,
  onStatusChange,
  onVisitTypeChange,
  onDateFromChange,
  onDateToChange,
}: VisitHistoryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            {VISIT_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
