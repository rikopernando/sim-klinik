/**
 * Discount Calculation Hook
 * Handles all discount and total calculations for payment processing
 */

import { useMemo } from "react"
import { calculateChange } from "@/lib/billing/billing-utils"
import type { PaymentMethod } from "@/types/billing"

export type DiscountType = "none" | "fixed" | "percentage" | "drugs_only" | "procedures_only"

interface DiscountCalculationParams {
  discountType: DiscountType
  discount: string
  discountPercentage: string
  insuranceCoverage: string
  subtotal: number
  currentTotal: number
  paidAmount: number
  remainingAmount: number
  drugsSubtotal?: number
  proceduresSubtotal?: number
  paymentMethod: PaymentMethod
  amountReceived: string
}

interface DiscountCalculationResult {
  discountAmount: number
  totalAfterDiscount: number
  insurance: number
  finalTotal: number
  changeAmount: string
  isValidDiscount: boolean
  isValidInsurance: boolean
  isValidTotal: boolean
  isValidPayment: boolean
  isValid: boolean
}

/**
 * Calculate discount amount, insurance, and final totals
 *
 * @param params - Calculation parameters
 * @returns Calculated amounts and validation states
 */
export function useDiscountCalculation(
  params: DiscountCalculationParams
): DiscountCalculationResult {
  const {
    discountType,
    discount,
    discountPercentage,
    insuranceCoverage,
    subtotal,
    currentTotal,
    paidAmount,
    remainingAmount,
    drugsSubtotal,
    proceduresSubtotal,
    paymentMethod,
    amountReceived,
  } = params

  // For partial payments, base calculations on remainingAmount
  // For new payments, base calculations on currentTotal
  const hasPartialPayment = paidAmount > 0
  const baseAmount = hasPartialPayment ? remainingAmount : currentTotal

  // Calculate discount amount based on type
  const discountAmount = useMemo(() => {
    // If there's already a partial payment, don't allow new discounts
    // (discount should have been applied when creating the billing)
    if (hasPartialPayment) {
      return 0
    }

    if (discountType === "fixed" && discount) {
      return parseFloat(discount) || 0
    } else if (discountType === "percentage" && discountPercentage) {
      const percentage = parseFloat(discountPercentage) || 0
      return (subtotal * percentage) / 100
    } else if (discountType === "drugs_only" && drugsSubtotal) {
      return drugsSubtotal
    } else if (discountType === "procedures_only" && proceduresSubtotal) {
      return proceduresSubtotal
    }
    return 0
  }, [
    hasPartialPayment,
    discountType,
    discountPercentage,
    discount,
    subtotal,
    drugsSubtotal,
    proceduresSubtotal,
  ])

  // Calculate total after discount
  const totalAfterDiscount = useMemo(() => {
    return Math.max(0, baseAmount - discountAmount)
  }, [baseAmount, discountAmount])

  // Parse insurance coverage
  const insurance = useMemo(() => {
    // If there's already a partial payment, don't allow new insurance
    if (hasPartialPayment) {
      return 0
    }
    return parseFloat(insuranceCoverage) || 0
  }, [hasPartialPayment, insuranceCoverage])

  // Calculate final total after insurance
  // This is what the patient needs to pay NOW
  const finalTotal = useMemo(() => {
    return Math.max(0, totalAfterDiscount - insurance)
  }, [totalAfterDiscount, insurance])

  // Calculate change for cash payments
  const changeAmount = useMemo(() => {
    if (paymentMethod === "cash" && amountReceived) {
      return calculateChange(amountReceived, finalTotal.toString())
    }
    return "0"
  }, [paymentMethod, amountReceived, finalTotal])

  // Validation
  const isValidDiscount = discountAmount >= 0 && discountAmount <= baseAmount
  const isValidInsurance = insurance >= 0 && insurance <= totalAfterDiscount
  const isValidTotal = finalTotal >= 0
  const isValidPayment = useMemo(() => {
    if (paymentMethod === "cash") {
      return parseFloat(amountReceived || "0") >= finalTotal && parseFloat(changeAmount) >= 0
    }
    return true
  }, [paymentMethod, amountReceived, finalTotal, changeAmount])

  const isValid = isValidDiscount && isValidInsurance && isValidTotal && isValidPayment

  return {
    discountAmount,
    totalAfterDiscount,
    insurance,
    finalTotal,
    changeAmount,
    isValidDiscount,
    isValidInsurance,
    isValidTotal,
    isValidPayment,
    isValid,
  }
}
