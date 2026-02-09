/**
 * Billing Module Type Definitions
 * Centralized types for Billing, Cashier, and Patient Discharge
 */

import { MedicalRecord } from "./medical-record"
import { Patient } from "./registration"
import { Visit } from "./visit"

/**
 * Payment Status Types
 */
export type PaymentStatus = "pending" | "partial" | "paid"

export const PAYMENT_STATUS = {
  PENDING: "pending" as PaymentStatus,
  PARTIAL: "partial" as PaymentStatus,
  PAID: "paid" as PaymentStatus,
} as const

/**
 * Payment Method Types
 */
export type PaymentMethod = "cash" | "transfer" | "card" | "insurance"

export const PAYMENT_METHODS = {
  CASH: "cash" as PaymentMethod,
  TRANSFER: "transfer" as PaymentMethod,
  CARD: "card" as PaymentMethod,
  INSURANCE: "insurance" as PaymentMethod,
} as const

/**
 * Service Type (from services master)
 */
export type ServiceType =
  | "consultation"
  | "procedure"
  | "room"
  | "laboratory"
  | "radiology"
  | "other"

/**
 * Billing Item Type
 */
export type BillingItemType = "service" | "drug" | "material" | "room" | "laboratory"

/**
 * Service Entity (Master Data)
 */
export interface Service {
  id: string
  code: string
  name: string
  serviceType: string
  price: string
  description: string | null
  category: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Billing Entity
 */
export interface Billing {
  id: string
  visitId: string
  subtotal: string
  discount: string
  discountPercentage: string | null
  tax: string
  totalAmount: string
  insuranceCoverage: string | null
  patientPayable: string
  paymentStatus: PaymentStatus
  paidAmount: string
  remainingAmount: string | null
  paymentMethod: string | null
  paymentReference: string | null
  processedBy: string | null
  processedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Billing Item Entity
 */
export interface BillingItem {
  id: string
  billingId: string
  itemType: BillingItemType
  itemId: string | null
  itemName: string
  itemCode: string | null
  quantity: number
  unitPrice: string
  subtotal: string
  discount: string | null
  totalPrice: string
  description: string | null
  createdAt: string
}

/**
 * Payment Entity
 */
export interface Payment {
  id: string
  billingId: string
  amount: string
  paymentMethod: PaymentMethod
  paymentReference: string | null
  amountReceived: string | null
  changeGiven: string | null
  receivedBy: string
  receivedAt: string
  notes: string | null
  createdAt: string
}

/**
 * Discharge Summary Entity
 */
export interface DischargeSummary {
  id: string
  visitId: string
  admissionDiagnosis: string
  dischargeDiagnosis: string
  clinicalSummary: string
  proceduresPerformed: string | null
  medicationsOnDischarge: string | null
  dischargeInstructions: string
  dietaryRestrictions: string | null
  activityRestrictions: string | null
  followUpDate: string | null
  followUpInstructions: string | null
  dischargedBy: string
  dischargedAt: string
  createdAt: string
  updatedAt: string
}

/**
 * Billing with Items and Payments
 */
export interface BillingWithDetails extends Billing {
  items: BillingItem[]
  payments: Payment[]
  visit?: {
    id: string
    visitNumber: string
    visitType: string
  }
  patient?: {
    id: string
    name: string
    mrNumber: string
  }
}

/**
 * Service Input Data
 */
export interface ServiceInput {
  code: string
  name: string
  serviceType: string
  price: string
  description?: string
  category?: string
}

/**
 * Service Update Input
 */
export interface ServiceUpdateInput {
  id: string
  code?: string
  name?: string
  serviceType?: string
  price?: string
  description?: string
  category?: string
  isActive?: boolean
}

/**
 * Billing Item Input
 */
export interface BillingItemInput {
  itemType: BillingItemType
  itemId?: string
  itemName: string
  itemCode?: string
  quantity: number
  unitPrice: string
  discount?: string
  description?: string
  totalPrice?: string
}

/**
 * Create Billing Input
 */
export interface CreateBillingInput {
  visitId: string
  items: BillingItemInput[]
  discount?: string
  discountPercentage?: string
  insuranceCoverage?: string
  notes?: string
}

/**
 * Payment Input
 */
export interface PaymentInput {
  billingId: string
  amount: string
  paymentMethod: PaymentMethod
  paymentReference?: string
  amountReceived?: string // For cash payments
  receivedBy: string
  notes?: string
}

/**
 * Process Payment Data (Merged Workflow)
 * Used for the unified discount + payment dialog
 */
export interface ProcessPaymentData {
  discountType: string
  discountPercentage?: string
  discount?: string
  insuranceCoverage?: string
  paymentMethod: PaymentMethod
  amountReceived?: string
  amount: string
  paymentReference?: string
  notes?: string
}

/**
 * Discharge Summary Input
 */
export interface DischargeSummaryInput {
  visitId: string
  admissionDiagnosis: string
  dischargeDiagnosis: string
  clinicalSummary: string
  proceduresPerformed?: string
  medicationsOnDischarge?: string
  dischargeInstructions: string
  dietaryRestrictions?: string
  activityRestrictions?: string
  followUpDate?: string
  followUpInstructions?: string
  dischargedBy: string
}

/**
 * Billing Statistics
 */
export interface BillingStatistics {
  totalBillings: number
  pendingBillings: number
  paidBillings: number
  partialBillings: number
  totalRevenue: string
  pendingRevenue: string
  collectedToday: string
}

/**
 * Billing Summary (for reports)
 */
export interface BillingSummary {
  visitId: string
  visitNumber: string
  patientName: string
  mrNumber: string
  visitType: string
  totalAmount: string
  paidAmount: string
  remainingAmount: string
  paymentStatus: PaymentStatus
  processedAt: string | null
}

/**
 * Receipt Data (for printing)
 */
export interface ReceiptData {
  billing: BillingWithDetails
  clinic: {
    name: string
    address: string
    phone: string
  }
  receiptNumber: string
  printedAt: string
}

export interface BillingQueueItem {
  visit: Visit
  patient: Patient
  billing: Billing | null
  medicalRecord: MedicalRecord
}

interface BillingFull {
  id: string
  visitId: string
  subtotal: string
  discount: string
  discountPercentage: string | null
  tax: string
  totalAmount: string
  insuranceCoverage: string
  patientPayable: string
  paymentStatus: PaymentStatus
  paidAmount: string
  remainingAmount: string
  paymentMethod: string | null
  paymentReference: string | null
  processedBy: string | null
  processedAt: Date | string | null
  notes: string | null
}

export interface BillingDetails {
  billing: BillingFull
  items: BillingItem[]
  payments: Payment[]
  patient: {
    name: string
    mrNumber: string
  }
  visit: {
    visitNumber: string
    createdAt: Date | string
  }
  cashier?: {
    name: string
  }
}

export interface ProcessPaymentResult {
  payment: {
    id: string
    amount: string
    paymentMethod: string
    changeGiven: string | null
  }
  discountApplied: boolean
  finalTotal: string
  paidAmount: string
  remainingAmount: string
  paymentStatus: PaymentStatus
  change: string | null
}

export interface DischargeBillingBreakdown {
  roomCharges?: Partial<{
    label: string
    amount: string
    count: number
  }>
  materialCharges?: Partial<{
    label: string
    amount: string
    count: number
  }>
  medicationCharges: {
    label: string
    amount: string
    count: number
  }
  procedureCharges: {
    label: string
    amount: string
    count: number
  }
  laboratoryCharges: {
    label: string
    amount: string
    count: number
  }
  serviceCharges: {
    label: string
    amount: string
    count: number
  }
}

/**
 * Discharge Billing Summary
 * Aggregated billing preview for inpatient discharge
 */
export interface DischargeBillingSummary {
  visitId?: string
  medicalRecordId?: string
  breakdown: DischargeBillingBreakdown
  subtotal: string
  totalItems: number
}
