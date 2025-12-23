/**
 * Room Constants
 * Centralized constants for room management
 */

import type { RoomType, RoomStatus } from "@/types/rooms"

/**
 * Room types with labels
 */
export const ROOM_TYPES: ReadonlyArray<{ value: RoomType; label: string }> = [
  { value: "VIP", label: "VIP" },
  { value: "Class 1", label: "Kelas 1" },
  { value: "Class 2", label: "Kelas 2" },
  { value: "Class 3", label: "Kelas 3" },
  { value: "ICU", label: "ICU" },
  { value: "NICU", label: "NICU" },
  { value: "Isolation", label: "Isolasi" },
] as const

/**
 * Room statuses with labels and badge variants
 */
export const ROOM_STATUSES: ReadonlyArray<{
  value: RoomStatus
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
}> = [
  { value: "available", label: "Tersedia", variant: "default" },
  { value: "occupied", label: "Terisi", variant: "secondary" },
  { value: "maintenance", label: "Maintenance", variant: "destructive" },
  { value: "reserved", label: "Dipesan", variant: "outline" },
] as const

/**
 * Filter options for room types
 */
export const ROOM_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  ...ROOM_TYPES,
] as const

/**
 * Filter options for room statuses
 */
export const ROOM_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  ...ROOM_STATUSES.map(({ value, label }) => ({ value, label })),
] as const

/**
 * Default filter values
 */
export const DEFAULT_ROOM_FILTERS = {
  search: "",
  status: "all" as const,
  roomType: "all" as const,
  isActive: "active",
} as const

/**
 * Debounce delay for search input (milliseconds)
 */
export const SEARCH_DEBOUNCE_DELAY = 500

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION_LIMIT = 10

/**
 * Form validation messages
 */
export const ROOM_VALIDATION_MESSAGES = {
  roomNumber: {
    required: "Nomor kamar wajib diisi",
    unique: "Nomor kamar sudah digunakan",
  },
  roomType: {
    required: "Tipe kamar wajib diisi",
  },
  bedCount: {
    required: "Jumlah bed wajib diisi",
    positive: "Jumlah bed harus lebih dari 0",
    min: "Jumlah bed minimal 1",
  },
  dailyRate: {
    required: "Tarif harian wajib diisi",
    positive: "Tarif harian harus lebih dari 0",
  },
} as const

/**
 * API endpoints
 */
export const ROOM_API_ENDPOINTS = {
  list: "/api/master-data/rooms",
  detail: (id: string) => `/api/master-data/rooms/${id}`,
  create: "/api/master-data/rooms",
  update: (id: string) => `/api/master-data/rooms/${id}`,
  delete: (id: string) => `/api/master-data/rooms/${id}`,
} as const
