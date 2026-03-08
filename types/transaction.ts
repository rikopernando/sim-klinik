/**
 * Transaction History Types
 * Types for transaction/payment history listing
 */

/**
 * Transaction History Item - represents a single payment transaction
 */
/**
 * Billing item - represents a single line item in a bill
 */
export interface BillingItemData {
  id: string
  itemType: string
  itemName: string
  itemCode: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
  totalPrice: number
}

export interface TransactionHistoryItem {
  payment: {
    id: string
    amount: number
    paymentMethod: string
    paymentReference: string | null
    amountReceived: number | null
    changeGiven: number | null
    receivedAt: string
    notes: string | null
  }
  billing: {
    id: string
    totalAmount: number
    paymentStatus: string
    items: BillingItemData[]
  }
  visit: {
    id: string
    visitNumber: string
    visitType: string
  }
  patient: {
    id: string
    mrNumber: string
    name: string
  }
  cashier: {
    id: string
    name: string
  }
}

/**
 * Filters for transaction history list
 */
export interface TransactionHistoryFilters {
  search?: string
  paymentMethod?: string
  visitType?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Payment method options for filter dropdown
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "Semua Metode" },
  { value: "cash", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "card", label: "Kartu" },
] as const

/**
 * Visit type options for filter dropdown
 */
export const VISIT_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "outpatient", label: "Rawat Jalan" },
  { value: "inpatient", label: "Rawat Inap" },
  { value: "emergency", label: "UGD" },
] as const
