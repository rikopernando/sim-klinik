/**
 * Room Filter Buttons Component
 * Filter buttons for room list
 */

import { Button } from "@/components/ui/button"
import type { RoomFilterType } from "@/hooks/use-room-filter"
import type { RoomStatistics } from "@/hooks/use-room-statistics"

interface RoomFilterButtonsProps {
  currentFilter: RoomFilterType
  onFilterChange: (filter: RoomFilterType) => void
  statistics: RoomStatistics
}

export function RoomFilterButtons({
  currentFilter,
  onFilterChange,
  statistics,
}: RoomFilterButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
      >
        Semua ({statistics.total})
      </Button>
      <Button
        variant={currentFilter === "available" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("available")}
      >
        Kosong ({statistics.available})
      </Button>
      <Button
        variant={currentFilter === "occupied" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("occupied")}
      >
        Terisi ({statistics.partial + statistics.full})
      </Button>
      <Button
        variant={currentFilter === "full" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("full")}
      >
        Penuh ({statistics.full})
      </Button>
    </div>
  )
}
