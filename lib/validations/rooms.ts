/**
 * Room Validation Schemas
 * Zod schemas for room data validation
 */

import { z } from "zod"
import { ROOM_VALIDATION_MESSAGES } from "@/lib/constants/rooms"

/**
 * Base room schema with common fields
 */
const baseRoomSchema = {
  roomNumber: z.string().min(1, ROOM_VALIDATION_MESSAGES.roomNumber.required).trim(),
  roomType: z.string().min(1, ROOM_VALIDATION_MESSAGES.roomType.required),
  bedCount: z
    .number({
      message: ROOM_VALIDATION_MESSAGES.bedCount.required,
    })
    .int()
    .min(1, ROOM_VALIDATION_MESSAGES.bedCount.min),
  floor: z.string().trim().optional(),
  building: z.string().trim().optional(),
  dailyRate: z.string().min(1, ROOM_VALIDATION_MESSAGES.dailyRate.required),
  facilities: z.string().trim().optional(),
  description: z.string().trim().optional(),
}

/**
 * Schema for creating a new room
 */
export const roomCreateSchema = z.object(baseRoomSchema)

/**
 * Schema for updating a room
 * All fields are optional except those that should remain required
 */
export const roomUpdateSchema = z.object({
  roomNumber: z.string().min(1).trim().optional(),
  roomType: z.string().min(1).optional(),
  bedCount: z.number().int().min(1).optional(),
  floor: z.string().trim().optional(),
  building: z.string().trim().optional(),
  dailyRate: z.string().min(1).optional(),
  facilities: z.string().trim().optional(),
  status: z.enum(["available", "occupied", "maintenance", "reserved"]).optional(),
  description: z.string().trim().optional(),
  availableBeds: z.number().int().min(0).optional(),
})

/**
 * Schema for room filters
 */
export const roomFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  roomType: z.string().optional(),
  floor: z.string().optional(),
  building: z.string().optional(),
  isActive: z.string().optional(),
})

/**
 * Type exports
 */
export type RoomCreateSchema = z.infer<typeof roomCreateSchema>
export type RoomUpdateSchema = z.infer<typeof roomUpdateSchema>
export type RoomFiltersSchema = z.infer<typeof roomFiltersSchema>
