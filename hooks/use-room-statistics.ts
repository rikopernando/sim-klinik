/**
 * Room Statistics Hook
 * Calculates statistics from room data
 */

import { useMemo } from "react"
import type { RoomWithOccupancy } from "@/types/inpatient"

export interface RoomStatistics {
  total: number
  available: number
  partial: number
  full: number
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
}

export function useRoomStatistics(rooms: RoomWithOccupancy[]): RoomStatistics {
  return useMemo(() => {
    const stats = {
      total: rooms.length,
      available: rooms.filter((r) => r.occupiedBeds === 0).length,
      partial: rooms.filter((r) => r.occupiedBeds > 0 && r.occupiedBeds < r.bedCount).length,
      full: rooms.filter((r) => r.occupiedBeds === r.bedCount).length,
      totalBeds: rooms.reduce((sum, r) => sum + r.bedCount, 0),
      occupiedBeds: rooms.reduce((sum, r) => sum + r.occupiedBeds, 0),
      occupancyRate: 0,
    }

    stats.occupancyRate =
      stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0

    return stats
  }, [rooms])
}
