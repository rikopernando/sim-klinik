/**
 * Triage Utility Functions
 * Centralized logic for triage handling
 */

import { TriageStatus, TriageConfig, TRIAGE_LEVELS } from "@/types/emergency"

/**
 * Triage Configuration Map
 */
export const TRIAGE_CONFIG: Record<string, TriageConfig> = {
  red: {
    status: TRIAGE_LEVELS.RED,
    label: "MERAH - Gawat Darurat",
    emoji: "🔴",
    description: "Immediate - Pasien memerlukan penanganan segera",
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-600",
    textColor: "text-red-700",
    priority: 1,
  },
  yellow: {
    status: TRIAGE_LEVELS.YELLOW,
    label: "KUNING - Urgent",
    emoji: "🟡",
    description: "Urgent - Pasien memerlukan penanganan dalam waktu dekat",
    color: "yellow",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-700",
    priority: 2,
  },
  green: {
    status: TRIAGE_LEVELS.GREEN,
    label: "HIJAU - Non-Urgent",
    emoji: "🟢",
    description: "Non-Urgent - Pasien dapat menunggu",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-600",
    textColor: "text-green-700",
    priority: 3,
  },
  untriaged: {
    status: null,
    label: "Belum Triage",
    emoji: "⚪",
    description: "Pasien belum dilakukan triage",
    color: "gray",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-gray-600",
    priority: 4,
  },
}

/**
 * Get triage configuration by status
 */
export function getTriageConfig(status: TriageStatus | null): TriageConfig {
  if (!status) return TRIAGE_CONFIG.untriaged
  return TRIAGE_CONFIG[status] || TRIAGE_CONFIG.untriaged
}

/**
 * Get triage badge color classes
 */
export function getTriageBadgeColor(status: TriageStatus | null): string {
  const config = getTriageConfig(status)
  return `bg-${config.color}-600 hover:bg-${config.color}-700 text-white`
}

/**
 * Get triage label with emoji
 */
export function getTriageLabel(status: TriageStatus | null): string {
  const config = getTriageConfig(status)
  return `${config.emoji} ${config.label}`
}

/**
 * Get triage priority for sorting
 */
export function getTriagePriority(status: TriageStatus | null): number {
  const config = getTriageConfig(status)
  return config.priority
}

/**
 * Get triage card classes (for highlighting queue items)
 */
export function getTriageCardClasses(status: TriageStatus | null): string {
  if (!status) return ""

  const config = getTriageConfig(status)
  return `border-l-4 ${config.borderColor} ${config.bgColor}/50`
}

/**
 * Get triage statistics color classes
 */
export function getTriageStatColor(status: TriageStatus): {
  card: string
  text: string
  bg: string
} {
  const config = getTriageConfig(status)
  return {
    card: `border-${config.color}-200 bg-${config.color}-50`,
    text: config.textColor,
    bg: config.bgColor,
  }
}

/**
 * Sort queue items by triage priority and arrival time
 */
export function sortByTriagePriority<
  T extends { visit: { triageStatus: TriageStatus | null; arrivalTime: string } },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // First, sort by triage priority
    const priorityDiff =
      getTriagePriority(a.visit.triageStatus) - getTriagePriority(b.visit.triageStatus)

    if (priorityDiff !== 0) return priorityDiff

    // If same priority, sort by arrival time (earliest first)
    return new Date(a.visit.arrivalTime).getTime() - new Date(b.visit.arrivalTime).getTime()
  })
}

/**
 * Validate triage status
 */
export function isValidTriageStatus(status: string): status is TriageStatus {
  return status === "red" || status === "yellow" || status === "green"
}

/**
 * Wait time thresholds by triage level (in minutes)
 */
export const WAIT_TIME_THRESHOLDS = {
  red: 5, // Red triage: alert if > 5 minutes
  yellow: 15, // Yellow triage: alert if > 15 minutes
  green: 30, // Green triage: alert if > 30 minutes
  untriaged: 10, // Untriaged: alert if > 10 minutes
} as const

/**
 * Calculate wait time in minutes from arrival time
 */
export function calculateWaitTimeMinutes(arrivalTime: string | Date): number {
  const arrival = new Date(arrivalTime)
  const now = new Date()
  return Math.floor((now.getTime() - arrival.getTime()) / (1000 * 60))
}

/**
 * Format wait time for display
 * Returns formatted string like "5 menit" or "1 jam 30 menit"
 */
export function formatWaitTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} jam`
  }
  return `${hours} jam ${remainingMinutes} menit`
}

/**
 * Check if wait time exceeds threshold for triage level
 */
export function isWaitTimeExceeded(
  arrivalTime: string | Date,
  triageStatus: TriageStatus | null
): boolean {
  const minutes = calculateWaitTimeMinutes(arrivalTime)
  const key = triageStatus || "untriaged"
  const threshold = WAIT_TIME_THRESHOLDS[key]
  return minutes > threshold
}

/**
 * Get wait time alert level based on triage and time
 * Returns "critical" | "warning" | "normal"
 */
export function getWaitTimeAlertLevel(
  arrivalTime: string | Date,
  triageStatus: TriageStatus | null
): "critical" | "warning" | "normal" {
  const minutes = calculateWaitTimeMinutes(arrivalTime)
  const key = triageStatus || "untriaged"
  const threshold = WAIT_TIME_THRESHOLDS[key]

  if (minutes > threshold * 2) {
    return "critical" // More than 2x threshold
  }
  if (minutes > threshold) {
    return "warning" // Exceeded threshold
  }
  return "normal"
}
