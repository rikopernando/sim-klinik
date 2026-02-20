/**
 * Lab History Filters Component
 * Filter controls for lab examination history (used inside FilterDrawer)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"

interface LabHistoryFiltersProps {
  status: string
  department: string
  dateFrom: string
  dateTo: string
  onStatusChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function LabHistoryFilters({
  status,
  department,
  dateFrom,
  dateTo,
  onStatusChange,
  onDepartmentChange,
  onDateFromChange,
  onDateToChange,
}: LabHistoryFiltersProps) {
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
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="ordered">Menunggu</SelectItem>
            <SelectItem value="specimen_collected">Spesimen Diambil</SelectItem>
            <SelectItem value="in_progress">Dalam Proses</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Filter */}
      <div className="space-y-2">
        <Label>Departemen</Label>
        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih departemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            <SelectItem value="LAB">Laboratorium</SelectItem>
            <SelectItem value="RAD">Radiologi</SelectItem>
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
