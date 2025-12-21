/**
 * Room Filter Hook
 * Handles room filtering logic
 */

import { useState, useMemo } from "react"
import type { RoomWithOccupancy } from "@/types/inpatient"

export type RoomFilterType = "all" | "available" | "occupied" | "full"

interface UseRoomFilterReturn {
  filter: RoomFilterType
  setFilter: (filter: RoomFilterType) => void
  filteredRooms: RoomWithOccupancy[]
}

export function useRoomFilter(rooms: RoomWithOccupancy[]): UseRoomFilterReturn {
  const [filter, setFilter] = useState<RoomFilterType>("all")

  const filteredRooms = useMemo(() => {
    switch (filter) {
      case "available":
        return rooms.filter((room) => room.occupiedBeds === 0)
      case "occupied":
        return rooms.filter((room) => room.occupiedBeds > 0)
      case "full":
        return rooms.filter((room) => room.occupiedBeds === room.bedCount)
      default:
        return rooms
    }
  }, [rooms, filter])

  return {
    filter,
    setFilter,
    filteredRooms,
  }
}
