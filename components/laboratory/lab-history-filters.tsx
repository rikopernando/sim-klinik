/**
 * Lab History Filters Component
 * Filter controls for lab order history
 */

"use client"

import { memo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePickerField } from "@/components/forms/date-picker-field"

interface LabHistoryFiltersProps {
  status: string
  setStatus: (value: string) => void
  department: string
  setDepartment: (value: string) => void
  dateFrom: string
  setDateFrom: (value: string) => void
  dateTo: string
  setDateTo: (value: string) => void
}

const currentYear = new Date().getFullYear() + 20

function LabHistoryFiltersComponent({
  status,
  setStatus,
  department,
  setDepartment,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: LabHistoryFiltersProps) {
  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date ? date.toISOString().split("T")[0] : "")
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date ? date.toISOString().split("T")[0] : "")
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
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
        <Select value={department} onValueChange={setDepartment}>
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

      {/* Date From */}
      <div className="space-y-2">
        <DatePickerField
          label="Dari Tanggal"
          value={dateFrom ? new Date(dateFrom) : undefined}
          onChange={handleDateFromChange}
          endMonth={new Date(currentYear, 12)}
        />
      </div>

      {/* Date To */}
      <div className="space-y-2">
        <DatePickerField
          label="Sampai Tanggal"
          value={dateTo ? new Date(dateTo) : undefined}
          onChange={handleDateToChange}
          endMonth={new Date(currentYear, 12)}
        />
      </div>
    </div>
  )
}

export const LabHistoryFilters = memo(LabHistoryFiltersComponent)
