/**
 * Date utility functions for the application
 */

import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as string or Date object
 * @returns Age in years, or null if invalid date
 */
export function calculateAge(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) return null

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  // Check for invalid date
  if (isNaN(birthDate.getTime())) return null

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Format date to Indonesian locale
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "31 Desember 2023")
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

/**
 * Format date to Indonesian locale
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "31 Desember 2023, 14:58")
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-"

  return format(new Date(dateString), "dd MMMM yyyy, HH:mm", {
    locale: localeId,
  })
}

/**
 * Format date to short Indonesian locale
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "31/12/2023")
 */
export function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"

    return date.toLocaleDateString("id-ID")
  } catch {
    return "-"
  }
}

/**
 * Get age display text
 * @param dateOfBirth - Date of birth
 * @returns Age text (e.g., "25 tahun") or "-"
 */
export function getAgeDisplay(dateOfBirth: string | Date | null | undefined): string {
  const age = calculateAge(dateOfBirth)
  return age !== null ? `${age} tahun` : "-"
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date()
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
