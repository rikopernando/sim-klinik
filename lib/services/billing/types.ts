/**
 * Billing Service Types
 * Type definitions for billing operations
 */

export interface BillingItem {
  itemType: string
  itemId: string | null
  itemName: string
  itemCode: string | null
  quantity: number
  unitPrice: string
  subtotal: string
  discount: string
  totalPrice: string
  description?: string
}

export interface BillingCalculation {
  visitId: string
  items: BillingItem[]
  subtotal: string
  totalAmount: string
}

export interface CreateBillingOptions {
  discount?: number
  discountPercentage?: number
  insuranceCoverage?: number
}

export interface ProcessPaymentData {
  amount: number
  paymentMethod: string
  paymentReference?: string
  amountReceived?: number
  notes?: string
}

export interface PaymentResult {
  paymentStatus: string
  paidAmount: number
  remainingAmount: number
  changeGiven: number
}
