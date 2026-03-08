/**
 * Disposition Utility Functions
 * Configuration and helpers for ER patient disposition
 */

import type { DispositionType } from "@/types/emergency"

/**
 * Disposition configuration with labels, colors, and descriptions
 */
export interface DispositionConfig {
  value: DispositionType
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}

export const DISPOSITION_CONFIG: Record<DispositionType, DispositionConfig> = {
  discharged: {
    value: "discharged",
    label: "Pulang",
    description: "Pasien dipulangkan ke rumah",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
  },
  admitted: {
    value: "admitted",
    label: "Rawat Inap",
    description: "Pasien dirawat inap di rumah sakit",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  referred: {
    value: "referred",
    label: "Rujuk",
    description: "Pasien dirujuk ke fasilitas kesehatan lain",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  observation: {
    value: "observation",
    label: "Observasi",
    description: "Pasien diobservasi di UGD",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
}

/**
 * Get disposition label in Indonesian
 */
export function getDispositionLabel(disposition: DispositionType | null): string {
  if (!disposition) return "-"
  return DISPOSITION_CONFIG[disposition]?.label || disposition
}

/**
 * Get disposition badge color classes
 */
export function getDispositionBadgeColor(disposition: DispositionType | null): string {
  if (!disposition) return "bg-gray-100 text-gray-700 border-gray-300"
  const config = DISPOSITION_CONFIG[disposition]
  return `${config.bgColor} ${config.color} ${config.borderColor}`
}

/**
 * Get all disposition options for dropdown/select
 */
export function getDispositionOptions(): DispositionConfig[] {
  return Object.values(DISPOSITION_CONFIG)
}

/**
 * Check if disposition requires follow-up action
 * (e.g., admitted requires bed assignment)
 */
export function dispositionRequiresAction(disposition: DispositionType): boolean {
  return disposition === "admitted" || disposition === "referred"
}
