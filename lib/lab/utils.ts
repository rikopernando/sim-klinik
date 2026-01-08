/**
 * Laboratory & Radiology Utilities
 * Helper functions for lab operations
 */

import { desc, ilike } from "drizzle-orm"
import { db } from "@/db"
import { labOrders } from "@/db/schema/laboratory"
import type { OrderStatus, ResultData, NumericResultData } from "@/types/lab"
import { RESULT_FLAGS } from "@/types/lab"

// ============================================================================
// ORDER NUMBER GENERATION
// ============================================================================

/**
 * Generate a unique order number for lab orders
 * Format: LAB-YYYYMMDD-0001
 */
export async function generateLabOrderNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "")

  // Get last order number for today
  const todayOrders = await db
    .select({ orderNumber: labOrders.orderNumber })
    .from(labOrders)
    .where(ilike(labOrders.orderNumber, `LAB-${dateStr}-%`))
    .orderBy(desc(labOrders.orderNumber))
    .limit(1)

  // Generate next number
  if (todayOrders.length === 0 || !todayOrders[0].orderNumber) {
    return `LAB-${dateStr}-0001`
  }

  const lastNumber = parseInt(todayOrders[0].orderNumber.split("-")[2])
  const nextNumber = lastNumber + 1

  return `LAB-${dateStr}-${String(nextNumber).padStart(4, "0")}`
}

// ============================================================================
// STATUS VALIDATION
// ============================================================================

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    ordered: ["specimen_collected", "cancelled"],
    specimen_collected: ["in_progress", "rejected"],
    in_progress: ["completed"],
    completed: ["verified"],
    verified: [], // Final state
    cancelled: [], // Final state
    rejected: [], // Final state
  }

  return validTransitions[from]?.includes(to) || false
}

/**
 * Get next valid statuses for current status
 */
export function getNextValidStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    ordered: ["specimen_collected", "cancelled"],
    specimen_collected: ["in_progress", "rejected"],
    in_progress: ["completed"],
    completed: ["verified"],
    verified: [],
    cancelled: [],
    rejected: [],
  }

  return validTransitions[currentStatus] || []
}

// ============================================================================
// RESULT ANALYSIS
// ============================================================================

/**
 * Check if a numeric result is critical
 */
export function isCriticalResult(result: NumericResultData): boolean {
  return result.flag === RESULT_FLAGS.CRITICAL_HIGH || result.flag === RESULT_FLAGS.CRITICAL_LOW
}

/**
 * Determine result flag based on value and reference range
 */
export function determineResultFlag(value: number, min: number, max: number): string {
  if (value < min) {
    // Check if critically low (< 50% of min)
    if (value < min * 0.5) {
      return RESULT_FLAGS.CRITICAL_LOW
    }
    return RESULT_FLAGS.LOW
  }

  if (value > max) {
    // Check if critically high (> 150% of max)
    if (value > max * 1.5) {
      return RESULT_FLAGS.CRITICAL_HIGH
    }
    return RESULT_FLAGS.HIGH
  }

  return RESULT_FLAGS.NORMAL
}

/**
 * Check if result data contains critical values
 */
export function hasAnyCriticalValue(resultData: ResultData): boolean {
  // Check if it's a numeric result
  if ("value" in resultData && "flag" in resultData) {
    return isCriticalResult(resultData as NumericResultData)
  }

  // For descriptive/radiology results, check for keywords
  if ("findings" in resultData) {
    const criticalKeywords = [
      "critical",
      "urgent",
      "emergency",
      "severe",
      "life-threatening",
      "immediate",
    ]
    const findings = resultData.findings.toLowerCase()
    return criticalKeywords.some((keyword) => findings.includes(keyword))
  }

  return false
}

// ============================================================================
// BUSINESS RULES
// ============================================================================

/**
 * Check if order can accept results
 */
export function canAcceptResults(status: OrderStatus): boolean {
  return status === "in_progress" || status === "specimen_collected"
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status === "ordered" || status === "specimen_collected"
}

/**
 * Check if result can be verified
 */
export function canVerifyResult(orderStatus: OrderStatus, isVerified: boolean): boolean {
  return orderStatus === "completed" && !isVerified
}

/**
 * Calculate estimated completion time
 */
export function calculateEstimatedCompletion(orderedAt: Date, tatHours: number): Date {
  const completion = new Date(orderedAt)
  completion.setHours(completion.getHours() + tatHours)
  return completion
}

/**
 * Check if order is overdue
 */
export function isOrderOverdue(
  orderedAt: Date,
  tatHours: number,
  currentStatus: OrderStatus
): boolean {
  if (currentStatus === "verified" || currentStatus === "cancelled") {
    return false
  }

  const estimatedCompletion = calculateEstimatedCompletion(orderedAt, tatHours)
  return new Date() > estimatedCompletion
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string | null): string {
  if (!orderNumber) return "N/A"
  return orderNumber
}

/**
 * Format test result for display
 */
export function formatTestResult(resultData: ResultData): string {
  if ("value" in resultData && "unit" in resultData) {
    return `${resultData.value} ${resultData.unit}`
  }

  if ("findings" in resultData) {
    return resultData.findings
  }

  return "No result data"
}

/**
 * Get status display color
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    ordered: "bg-gray-500",
    specimen_collected: "bg-blue-500",
    in_progress: "bg-yellow-500",
    completed: "bg-green-500",
    verified: "bg-emerald-600",
    cancelled: "bg-red-500",
    rejected: "bg-orange-500",
  }

  return colors[status] || "bg-gray-500"
}

/**
 * Get status display label
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    ordered: "Ordered",
    specimen_collected: "Specimen Collected",
    in_progress: "In Progress",
    completed: "Completed",
    verified: "Verified",
    cancelled: "Cancelled",
    rejected: "Rejected",
  }

  return labels[status] || status
}

/**
 * Get urgency display color
 */
export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    routine: "bg-gray-500",
    urgent: "bg-orange-500",
    stat: "bg-red-600",
  }

  return colors[urgency] || "bg-gray-500"
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate result data structure matches template
 */
export function validateResultAgainstTemplate(
  resultData: ResultData,
  template: { type: string }
): { valid: boolean; error?: string } {
  if (!template) {
    return { valid: true }
  }

  // Numeric template
  if (template.type === "numeric") {
    if (!("value" in resultData)) {
      return { valid: false, error: "Numeric result requires 'value' field" }
    }
    return { valid: true }
  }

  // Multi-parameter template
  if (template.type === "multi_parameter") {
    // Multi-parameter results use separate parameters table
    return { valid: true }
  }

  // Descriptive template
  if (template.type === "descriptive") {
    if (!("findings" in resultData)) {
      return { valid: false, error: "Descriptive result requires 'findings' field" }
    }
    return { valid: true }
  }

  return { valid: true }
}
