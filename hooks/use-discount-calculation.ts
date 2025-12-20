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
    drugsSubtotal,
    proceduresSubtotal,
    paymentMethod,
    amountReceived,
  } = params

  // Calculate discount amount based on type
  const discountAmount = useMemo(() => {
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
  }, [discountType, discountPercentage, discount, subtotal, drugsSubtotal, proceduresSubtotal])

  // Calculate total after discount
  const totalAfterDiscount = useMemo(() => {
    return Math.max(0, currentTotal - discountAmount)
  }, [currentTotal, discountAmount])

  // Parse insurance coverage
  const insurance = parseFloat(insuranceCoverage) || 0

  // Calculate final total after insurance
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
  const isValidDiscount = discountAmount >= 0 && discountAmount <= currentTotal
  const isValidInsurance = insurance >= 0 && insurance <= totalAfterDiscount
  const isValidTotal = finalTotal >= 0
  const isValidPayment = useMemo(() => {
    if (paymentMethod === "cash") {
      return amountReceived && parseFloat(amountReceived) > 0 && parseFloat(changeAmount) >= 0
    }
    return true
  }, [paymentMethod, amountReceived, changeAmount])

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
