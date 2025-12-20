/**
 * Billing Calculations Hook
 * Extracts billing calculations logic for better reusability
 */

import { useMemo } from "react"
import type { BillingDetails } from "@/types/billing"

interface BillingCalculations {
  subtotal: number
  totalAmount: number
  drugsSubtotal: number
  proceduresSubtotal: number
}

/**
 * Calculate billing totals and item-specific subtotals
 *
 * @param billingDetails - The billing details object
 * @returns Calculated billing amounts
 */
export function useBillingCalculations(billingDetails: BillingDetails | null): BillingCalculations {
  // Calculate main subtotal
  const subtotal = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(billingDetails.billing.subtotal)
  }, [billingDetails])

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!billingDetails) return 0
    return parseFloat(billingDetails.billing.totalAmount)
  }, [billingDetails])

  // Calculate drugs subtotal
  const drugsSubtotal = useMemo(() => {
    if (!billingDetails) return 0
    return billingDetails.items
      .filter((item) => item.itemType === "drug")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
  }, [billingDetails])

  // Calculate procedures/services subtotal
  const proceduresSubtotal = useMemo(() => {
    if (!billingDetails) return 0
    return billingDetails.items
      .filter((item) => item.itemType === "service")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
  }, [billingDetails])

  return {
    subtotal,
    totalAmount,
    drugsSubtotal,
    proceduresSubtotal,
  }
}
