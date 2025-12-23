/**
 * Inpatient Module Constants
 * Centralized constants for inpatient management
 */

/**
 * Sort options for patient list
 */
export const SORT_OPTIONS = [
  { value: "admissionDate", label: "Tanggal Masuk" },
  { value: "roomNumber", label: "Nomor Kamar" },
  { value: "patientName", label: "Nama Pasien" },
] as const

/**
 * Days threshold for warning badge
 */
export const LONG_STAY_THRESHOLD = 7

/**
 * Default debounce delay for search (ms)
 */
export const SEARCH_DEBOUNCE_DELAY = 500
