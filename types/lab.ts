/**
 * Laboratory & Radiology Type Definitions
 * Type-safe interfaces for lab tests, orders, results, and notifications
 */

import { ResultData } from "@/lib/lab"

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const LAB_DEPARTMENTS = {
  LAB: "LAB",
  RAD: "RAD",
} as const

export type LabDepartment = (typeof LAB_DEPARTMENTS)[keyof typeof LAB_DEPARTMENTS]

export const LAB_CATEGORIES = {
  // Laboratory
  HEMATOLOGY: "Hematology",
  CHEMISTRY: "Chemistry",
  IMMUNOLOGY: "Immunology",
  MICROBIOLOGY: "Microbiology",
  URINALYSIS: "Urinalysis",
  // Radiology
  XRAY: "X-Ray",
  CT_SCAN: "CT Scan",
  MRI: "MRI",
  ULTRASOUND: "Ultrasound",
} as const

export type LabCategory = (typeof LAB_CATEGORIES)[keyof typeof LAB_CATEGORIES]

export const ORDER_URGENCY = {
  ROUTINE: "routine",
  URGENT: "urgent",
  STAT: "stat",
} as const

export type OrderUrgency = (typeof ORDER_URGENCY)[keyof typeof ORDER_URGENCY]

export const ORDER_STATUS = {
  ORDERED: "ordered",
  SPECIMEN_COLLECTED: "specimen_collected",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  VERIFIED: "verified",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const RESULT_FLAGS = {
  NORMAL: "normal",
  HIGH: "high",
  LOW: "low",
  CRITICAL_HIGH: "critical_high",
  CRITICAL_LOW: "critical_low",
} as const

export type ResultFlag = (typeof RESULT_FLAGS)[keyof typeof RESULT_FLAGS]

export const NOTIFICATION_TYPES = {
  RESULT_READY: "result_ready",
  CRITICAL_VALUE: "critical_value",
  ORDER_CANCELLED: "order_cancelled",
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export const ATTACHMENT_TYPES = {
  PDF: "PDF",
  JPEG: "JPEG",
  PNG: "PNG",
  DICOM: "DICOM",
} as const

export type AttachmentType = (typeof ATTACHMENT_TYPES)[keyof typeof ATTACHMENT_TYPES]

// ============================================================================
// DATABASE MODELS (matching Drizzle schema)
// ============================================================================

export interface LabTest {
  id: string
  code: string
  name: string
  category: string
  department: LabDepartment
  price: string // Decimal as string
  specimenType: string | null
  specimenVolume: string | null
  specimenContainer: string | null
  tatHours: number | null
  loincCode: string | null
  cptCode: string | null
  resultTemplate: ResultTemplate | null
  description: string | null
  instructions: string | null
  isActive: boolean | null
  requiresFasting: boolean | null
  createdAt: Date
  updatedAt: Date
}

export interface LabTestPanel {
  id: string
  code: string
  name: string
  description: string | null
  price: string // Decimal as string
  isActive: boolean | null
  createdAt: Date
  updatedAt: Date
}

export interface LabTestPanelItem {
  id: string
  panelId: string
  testId: string
  createdAt: Date
}

export interface LabOrder {
  id: string
  visitId: string
  patientId: string
  testId: string | null
  panelId: string | null
  orderNumber: string | null
  urgency: OrderUrgency | null
  clinicalIndication: string | null
  orderedBy: string
  orderedAt: Date
  specimenCollectedBy: string | null
  specimenCollectedAt: Date | null
  specimenNotes: string | null
  processedBy: string | null
  startedAt: Date | null
  verifiedBy: string | null
  verifiedAt: Date | null
  completedAt: Date | null
  status: OrderStatus | null
  price: string // Decimal as string
  isBilled: boolean | null
  billingItemId: string | null
  notes: string | null
  cancelledReason: string | null
  createdAt: Date
  updatedAt: Date
}

export interface LabResult {
  id: string
  orderId: string
  resultData: ResultData
  attachmentUrl: string | null
  attachmentType: AttachmentType | null
  resultNotes: string | null
  criticalValue: boolean | null
  isVerified: boolean | null
  verifiedBy: string | null
  verifiedAt: Date | null
  enteredBy: string
  enteredAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface LabResultParameter {
  id: string
  resultId: string
  parameterName: string
  parameterValue: string
  unit: string | null
  referenceMin: string | null // Decimal as string
  referenceMax: string | null // Decimal as string
  flag: ResultFlag | null
  createdAt: Date
}

export interface LabNotification {
  id: string
  orderId: string
  recipientId: string
  notificationType: NotificationType
  message: string
  isRead: boolean | null
  readAt: Date | null
  sentViaEmail: boolean | null
  sentViaSms: boolean | null
  sentViaApp: boolean | null
  createdAt: Date
}

// ============================================================================
// RESULT DATA STRUCTURES (JSONB flexible formats)
// ============================================================================

export type ResultTemplate =
  | NumericResultTemplate
  | MultiParameterResultTemplate
  | DescriptiveResultTemplate

export interface NumericResultTemplate {
  type: "numeric"
  unit: string
  referenceRange: {
    min: number
    max: number
  }
}

export interface MultiParameterResultTemplate {
  type: "multi_parameter"
  parameters: Array<{
    name: string
    unit: string
    referenceRange: {
      min: number
      max: number
    }
  }>
}

export interface DescriptiveResultTemplate {
  type: "descriptive"
  fields: string[] // e.g., ["findings", "impression"]
}

export interface NumericResultData {
  value: number
  unit: string
  referenceRange: {
    min: number
    max: number
  }
  flag: ResultFlag
  interpretation?: string
}

export interface MultiParameterResultData {
  parameters?: Array<{
    name: string
    value: number
    unit: string
    referenceRange: {
      min: number
      max: number
    }
    flag: ResultFlag
  }>
}

export interface DescriptiveResultData {
  findings: string
  interpretation: string
}

export interface RadiologyResultData {
  findings: string
  impression: string
  technique?: string
  comparison?: string
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Lab Test APIs
export interface CreateLabTestInput {
  code: string
  name: string
  category: string
  department: LabDepartment
  price: number
  specimenType?: string
  specimenVolume?: string
  specimenContainer?: string
  tatHours?: number
  loincCode?: string
  cptCode?: string
  resultTemplate?: ResultTemplate
  description?: string
  instructions?: string
  requiresFasting?: boolean
}

export interface UpdateLabTestInput extends Partial<CreateLabTestInput> {
  isActive?: boolean
}

// Lab Order APIs
export interface CreateLabOrderInput {
  visitId: string
  patientId: string
  testId?: string
  panelId?: string
  urgency?: OrderUrgency
  clinicalIndication?: string
  notes?: string
}

export interface UpdateLabOrderStatusInput {
  status: OrderStatus
  notes?: string
  cancelledReason?: string
}

export interface CollectSpecimenInput {
  specimenNotes?: string
}

export interface StartProcessingInput {
  notes?: string
}

export interface VerifyLabResultInput {
  resultId: string
  notes?: string
}

// ============================================================================
// VIEW MODELS (with relations for UI)
// ============================================================================

export interface LabOrderWithRelations extends LabOrder {
  test?: LabTest
  panel?: LabTestPanel & { tests?: LabTest[] }
  patient: {
    id: string
    name: string
    mrNumber: string
  }
  orderedByUser: {
    id: string
    name: string
  }
  result?: LabResult & {
    parameters?: LabResultParameter[]
  }
}

export interface LabTestWithPanels extends LabTest {
  panels?: LabTestPanel[]
}

export interface LabTestPanelWithTests extends LabTestPanel {
  tests: LabTest[]
}

export interface LabNotificationWithOrder extends LabNotification {
  order: LabOrderWithRelations
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface LabOrderFilters {
  visitId?: string
  patientId?: string
  status?: OrderStatus | OrderStatus[]
  urgency?: OrderUrgency
  department?: LabDepartment
  orderedBy?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string // Search by order number or patient name
}

export interface LabTestFilters {
  category?: string
  department?: LabDepartment
  isActive?: boolean
  search?: string // Search by code or name
}

// ============================================================================
// STATISTICS & ANALYTICS TYPES
// ============================================================================

export interface LabStatistics {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  avgTurnaroundTime: number // in hours
  criticalResults: number
  byDepartment: {
    lab: number
    radiology: number
  }
  byStatus: Record<OrderStatus, number>
}

export interface LabRevenueReport {
  period: {
    from: Date
    to: Date
  }
  totalRevenue: number
  totalOrders: number
  revenueByDepartment: {
    lab: number
    radiology: number
  }
  topTests: Array<{
    testId: string
    testName: string
    orderCount: number
    revenue: number
  }>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LabOrderStatusTransition = {
  from: OrderStatus
  to: OrderStatus
  allowedRoles: string[]
}

export const LAB_ORDER_TRANSITIONS: LabOrderStatusTransition[] = [
  {
    from: ORDER_STATUS.ORDERED,
    to: ORDER_STATUS.SPECIMEN_COLLECTED,
    allowedRoles: ["nurse", "lab_technician"],
  },
  {
    from: ORDER_STATUS.SPECIMEN_COLLECTED,
    to: ORDER_STATUS.IN_PROGRESS,
    allowedRoles: ["lab_technician", "radiologist"],
  },
  {
    from: ORDER_STATUS.IN_PROGRESS,
    to: ORDER_STATUS.COMPLETED,
    allowedRoles: ["lab_technician", "radiologist"],
  },
  {
    from: ORDER_STATUS.COMPLETED,
    to: ORDER_STATUS.VERIFIED,
    allowedRoles: ["lab_supervisor", "radiologist"],
  },
  {
    from: ORDER_STATUS.ORDERED,
    to: ORDER_STATUS.CANCELLED,
    allowedRoles: ["doctor", "admin"],
  },
  {
    from: ORDER_STATUS.SPECIMEN_COLLECTED,
    to: ORDER_STATUS.REJECTED,
    allowedRoles: ["lab_technician", "lab_supervisor"],
  },
]
