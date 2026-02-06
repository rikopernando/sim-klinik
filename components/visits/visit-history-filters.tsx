/**
 * Visit History Filters Component
 * Filter controls for the visit history list
 */

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { VISIT_TYPE_OPTIONS, VISIT_STATUS_FILTER_OPTIONS } from "@/types/visit-history"
import { format } from "date-fns"

interface VisitHistoryFiltersProps {
  search: string
  status: string
  visitType: string
  dateFrom: string
  dateTo: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onVisitTypeChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function VisitHistoryFilters({
  search,
  status,
  visitType,
  dateFrom,
  dateTo,
  onSearchChange,
  onStatusChange,
  onVisitTypeChange,
  onDateFromChange,
  onDateToChange,
}: VisitHistoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Cari nama pasien, No. RM, No. Kunjungan..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {VISIT_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Visit Type Filter */}
        <Select value={visitType} onValueChange={onVisitTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tipe Kunjungan" />
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DatePickerField
          label="Dari Tanggal"
          placeholder="Pilih tanggal awal"
          value={dateFrom ? new Date(dateFrom) : undefined}
          onChange={(date) => onDateFromChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
        <DatePickerField
          label="Sampai Tanggal"
          placeholder="Pilih tanggal akhir"
          value={dateTo ? new Date(dateTo) : undefined}
          onChange={(date) => onDateToChange(date ? format(date, "yyyy-MM-dd") : "")}
          endMonth={new Date()}
        />
      </div>
    </div>
  )
}
