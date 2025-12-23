/**
 * Inpatient Patient List Filters Component
 * Filter controls for the patient list
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
import { ROOM_TYPES } from "@/lib/constants/rooms"

interface PatientListFiltersProps {
  search: string
  roomType: string
  onSearchChange: (value: string) => void
  onRoomTypeChange: (value: string) => void
}

export function PatientListFilters({
  search,
  roomType,
  onSearchChange,
  onRoomTypeChange,
}: PatientListFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      {/* Search Input */}
      <div className="md:col-span-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Cari nama pasien, No. RM, nomor kamar..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        {/* Room Type Filter */}
        <Select value={roomType} onValueChange={onRoomTypeChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipe Kamar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            {ROOM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
