/**
 * Room Types
 * Centralized type definitions for room management
 */

/**
 * Room entity from database
 */
export interface Room {
  id: string
  roomNumber: string
  roomType: string
  bedCount: number
  availableBeds: number
  floor: string | null
  building: string | null
  dailyRate: string
  facilities: string | null
  status: RoomStatus
  description: string | null
  isActive: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Room status enum
 */
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved"

/**
 * Room type enum
 */
export type RoomType = "VIP" | "Class I" | "Class II" | "Class III" | "ICU" | "NICU" | "Isolation"

/**
 * Form data for creating a room
 */
export interface RoomCreateInput {
  roomNumber: string
  roomType: string
  bedCount: number
  floor?: string
  building?: string
  dailyRate: string
  facilities?: string
  description?: string
}

/**
 * Form data for updating a room
 */
export interface RoomUpdateInput {
  roomNumber?: string
  roomType?: string
  bedCount?: number
  floor?: string
  building?: string
  dailyRate?: string
  facilities?: string
  status?: RoomStatus
  description?: string
}

/**
 * Filters for room list
 */
export interface RoomFilters {
  search?: string
  roomType?: string | "all"
  isActive?: string
}

/**
 * API response for room list
 */
export interface RoomListResponse {
  status: number
  message: string
  data: Room[]
}

/**
 * API response for single room
 */
export interface RoomResponse {
  status: number
  message: string
  data: Room
}

/**
 * API error response
 */
export interface RoomErrorResponse {
  status: number
  message: string
  error: string | unknown
}
