/**
 * Room Utility Functions
 * Centralized logic for room management
 */

import { Room, RoomWithOccupancy, RoomStatusConfig, RoomStatistics } from "@/types/inpatient"

/**
 * Room Status Configuration
 */
export const ROOM_STATUS_CONFIG: Record<string, RoomStatusConfig> = {
  empty: {
    status: "available",
    label: "Kosong",
    color: "green",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
    textColor: "text-green-700",
    badgeColor: "bg-green-600",
  },
  partial: {
    status: "occupied",
    label: "Tersedia Sebagian",
    color: "yellow",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-700",
    badgeColor: "bg-yellow-600",
  },
  full: {
    status: "occupied",
    label: "Penuh",
    color: "red",
    bgColor: "bg-red-100",
    borderColor: "border-red-500",
    textColor: "text-red-700",
    badgeColor: "bg-red-600",
  },
  maintenance: {
    status: "maintenance",
    label: "Maintenance",
    color: "gray",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-500",
    textColor: "text-gray-700",
    badgeColor: "bg-gray-600",
  },
}

/**
 * Get room status configuration based on occupancy
 */
export function getRoomStatusConfig(room: RoomWithOccupancy): RoomStatusConfig {
  if (room.status === "maintenance") {
    return ROOM_STATUS_CONFIG.maintenance
  }

  if (room.occupiedBeds === 0) {
    return ROOM_STATUS_CONFIG.empty
  } else if (room.occupiedBeds < room.bedCount) {
    return ROOM_STATUS_CONFIG.partial
  } else {
    return ROOM_STATUS_CONFIG.full
  }
}

/**
 * Get room card color classes
 */
export function getRoomCardClasses(room: RoomWithOccupancy): string {
  const config = getRoomStatusConfig(room)
  return `border-l-4 ${config.bgColor} ${config.borderColor} ${config.textColor}`
}

/**
 * Get room status badge color
 */
export function getRoomBadgeColor(room: RoomWithOccupancy): string {
  const config = getRoomStatusConfig(room)
  return config.badgeColor
}

/**
 * Get room status label
 */
export function getRoomStatusLabel(room: RoomWithOccupancy): string {
  const config = getRoomStatusConfig(room)
  return config.label
}

/**
 * Get occupancy progress bar color
 */
export function getOccupancyBarColor(occupancyRate: number): string {
  if (occupancyRate === 100) return "bg-red-600"
  if (occupancyRate > 0) return "bg-yellow-600"
  return "bg-green-600"
}

/**
 * Calculate room statistics
 */
export function calculateRoomStatistics(rooms: RoomWithOccupancy[]): RoomStatistics {
  const totalBeds = rooms.reduce((sum, r) => sum + r.bedCount, 0)
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0)

  return {
    total: rooms.length,
    available: rooms.filter((r) => r.occupiedBeds === 0).length,
    partial: rooms.filter((r) => r.occupiedBeds > 0 && r.occupiedBeds < r.bedCount).length,
    full: rooms.filter((r) => r.occupiedBeds === r.bedCount).length,
    totalBeds,
    occupiedBeds,
    occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
  }
}

/**
 * Filter rooms by status
 */
export function filterRoomsByStatus(
  rooms: RoomWithOccupancy[],
  filter: "all" | "available" | "occupied" | "full"
): RoomWithOccupancy[] {
  switch (filter) {
    case "available":
      return rooms.filter((r) => r.occupiedBeds === 0)
    case "occupied":
      return rooms.filter((r) => r.occupiedBeds > 0)
    case "full":
      return rooms.filter((r) => r.occupiedBeds === r.bedCount)
    default:
      return rooms
  }
}

/**
 * Calculate occupancy rate
 */
export function calculateOccupancyRate(occupiedBeds: number, totalBeds: number): number {
  if (totalBeds === 0) return 0
  return Math.round((occupiedBeds / totalBeds) * 100)
}

/**
 * Format room location
 */
export function formatRoomLocation(building: string | null, floor: string | null): string {
  const parts = []
  if (building) parts.push(building)
  if (floor) parts.push(`Lantai ${floor}`)
  return parts.join(", ")
}

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return `Rp ${numAmount.toLocaleString("id-ID")}`
}

/**
 * Check if room has available beds
 */
export function hasAvailableBeds(room: Room): boolean {
  return room.availableBeds > 0 && room.status !== "maintenance"
}

/**
 * Validate bed number format
 */
export function isValidBedNumber(bedNumber: string): boolean {
  return /^[A-Z0-9]+$/.test(bedNumber)
}

/**
 * Sort rooms by room number
 */
export function sortRoomsByNumber(rooms: RoomWithOccupancy[]): RoomWithOccupancy[] {
  return [...rooms].sort((a, b) => {
    // Extract numeric part for proper sorting
    const aNum = parseInt(a.roomNumber.replace(/\D/g, ""), 10) || 0
    const bNum = parseInt(b.roomNumber.replace(/\D/g, ""), 10) || 0
    return aNum - bNum
  })
}
