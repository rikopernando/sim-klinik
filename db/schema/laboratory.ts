/**
 * Laboratory & Radiology Schema
 * Tables for lab test management, ordering, results, and notifications
 */

import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core"
import { visits } from "./visits"
import { patients } from "./patients"
import { user } from "./auth"
import { billingItems } from "./billing"

/**
 * Lab Tests Master Table
 * Catalog of all available lab tests and radiology services
 */
export const labTests = pgTable("lab_tests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Test identification
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "CBC", "HBA1C", "XRAY-CHEST"
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Complete Blood Count"
  category: varchar("category", { length: 100 }).notNull(), // "Hematology", "Chemistry", "Radiology", etc.
  department: varchar("department", { length: 50 }).notNull(), // "LAB" or "RAD"

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

  // Clinical information
  specimenType: varchar("specimen_type", { length: 100 }), // "Blood", "Urine", "Sputum", etc.
  specimenVolume: varchar("specimen_volume", { length: 50 }), // "5 mL", "10 mL", etc.
  specimenContainer: varchar("specimen_container", { length: 100 }), // "EDTA tube", "Plain tube", etc.

  // Turnaround time
  tatHours: integer("tat_hours").default(24), // Standard turnaround time in hours

  // Integration codes (for future use)
  loincCode: varchar("loinc_code", { length: 20 }), // LOINC code for interoperability
  cptCode: varchar("cpt_code", { length: 20 }), // CPT code for billing

  // Result structure (flexible JSON)
  resultTemplate: jsonb("result_template"), // Define expected result fields
  // Example: {"type": "numeric", "unit": "mg/dL", "reference_range": {"min": 70, "max": 100}}
  // Example: {"type": "multi_parameter", "parameters": [{...}]}
  // Example: {"type": "descriptive", "fields": ["findings", "impression"]}

  // Metadata
  description: text("description"),
  instructions: text("instructions"), // Patient preparation instructions
  isActive: boolean("is_active").default(true),
  requiresFasting: boolean("requires_fasting").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Test Panels Table
 * Groups of tests that are commonly ordered together
 */
export const labTestPanels = pgTable("lab_test_panels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "DIABETES-PANEL"
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Diabetes Panel"
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Discounted panel price
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Test Panel Items Table
 * Links tests to panels (many-to-many relationship)
 */
export const labTestPanelItems = pgTable("lab_test_panel_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  panelId: text("panel_id")
    .notNull()
    .references(() => labTestPanels.id, { onDelete: "cascade" }),
  testId: text("test_id")
    .notNull()
    .references(() => labTests.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Orders Table
 * Records of lab/radiology tests ordered for patients
 */
export const labOrders = pgTable("lab_orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Visit & Patient context
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),

  // Test reference (either test_id OR panel_id should be filled)
  testId: text("test_id").references(() => labTests.id),
  panelId: text("panel_id").references(() => labTestPanels.id),

  // Panel expansion support (Option A implementation)
  // When a panel is ordered, we create a parent order (with panelId) and child orders (with testId)
  parentOrderId: text("parent_order_id"), // Self-reference to lab_orders.id
  // If this is set, this order is a child test of a panel order
  // The parent order holds the panel info and billing
  // Child orders are for individual test result entry (price = 0 to prevent double billing)

  // Order details
  orderNumber: varchar("order_number", { length: 50 }).unique(), // Auto-generated: LAB-2025-0001
  urgency: varchar("urgency", { length: 20 }).default("routine"), // "routine", "urgent", "stat"
  clinicalIndication: text("clinical_indication"), // Why this test was ordered

  // Ordering info
  orderedBy: text("ordered_by")
    .notNull()
    .references(() => user.id),
  orderedAt: timestamp("ordered_at", { withTimezone: true }).defaultNow().notNull(),

  // Specimen info
  specimenCollectedBy: text("specimen_collected_by").references(() => user.id),
  specimenCollectedAt: timestamp("specimen_collected_at", {
    withTimezone: true,
  }),
  specimenNotes: text("specimen_notes"),

  // Processing info
  processedBy: text("processed_by").references(() => user.id), // Lab technician
  startedAt: timestamp("started_at", { withTimezone: true }), // When analysis started

  // Verification info
  verifiedBy: text("verified_by").references(() => user.id), // Supervisor/Pathologist
  verifiedAt: timestamp("verified_at", { withTimezone: true }),

  // Completion info
  completedAt: timestamp("completed_at", { withTimezone: true }),

  // Status tracking
  status: varchar("status", { length: 50 }).default("ordered"),
  // Possible values:
  // "ordered" → "specimen_collected" → "in_progress" → "completed" → "verified"
  // Can also be: "cancelled", "rejected" (bad specimen)

  // Financial
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Snapshot of price at order time
  isBilled: boolean("is_billed").default(false),
  billingItemId: text("billing_item_id").references(() => billingItems.id),

  // Metadata
  notes: text("notes"), // General notes
  cancelledReason: text("cancelled_reason"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Results Table
 * Stores test results with flexible JSONB structure
 */
export const labResults = pgTable("lab_results", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  orderId: text("order_id")
    .notNull()
    .references(() => labOrders.id, { onDelete: "cascade" }),

  // Result data (flexible structure using JSONB)
  resultData: jsonb("result_data").notNull(),
  // Example for numeric test:
  // {
  //   "value": 120,
  //   "unit": "mg/dL",
  //   "reference_range": {"min": 70, "max": 100},
  //   "flag": "high",
  //   "interpretation": "Above normal range"
  // }
  //
  // Example for text/descriptive:
  // {
  //   "findings": "No bacteria seen",
  //   "interpretation": "Negative for infection"
  // }
  //
  // Example for radiology:
  // {
  //   "findings": "Clear lung fields, no infiltrates",
  //   "impression": "Normal chest X-ray"
  // }

  // Attached files (for complex reports/images)
  attachmentUrl: text("attachment_url"), // Path to file storage
  attachmentType: varchar("attachment_type", { length: 50 }), // "PDF", "JPEG", "PNG", "DICOM"

  // Result metadata
  resultNotes: text("result_notes"), // Technician comments
  criticalValue: boolean("critical_value").default(false), // Requires immediate attention

  // Quality control
  isVerified: boolean("is_verified").default(false),
  verifiedBy: text("verified_by").references(() => user.id),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),

  // Timestamps
  enteredBy: text("entered_by")
    .notNull()
    .references(() => user.id),
  enteredAt: timestamp("entered_at", { withTimezone: true }).defaultNow().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Result Parameters Table
 * For multi-parameter tests (e.g., CBC with WBC, RBC, Hemoglobin, etc.)
 */
export const labResultParameters = pgTable("lab_result_parameters", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  resultId: text("result_id")
    .notNull()
    .references(() => labResults.id, { onDelete: "cascade" }),

  parameterName: varchar("parameter_name", { length: 100 }).notNull(), // "WBC", "RBC", "Hemoglobin", etc.
  parameterValue: text("parameter_value").notNull(), // "8.5", "4.2M", etc.
  unit: varchar("unit", { length: 50 }), // "10^3/uL", "g/dL", etc.

  referenceMin: decimal("reference_min", { precision: 10, scale: 2 }),
  referenceMax: decimal("reference_max", { precision: 10, scale: 2 }),
  flag: varchar("flag", { length: 20 }), // "normal", "high", "low", "critical_high", "critical_low"

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Lab Notifications Table
 * Tracks notifications sent to doctors about lab results
 */
export const labNotifications = pgTable("lab_notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  orderId: text("order_id")
    .notNull()
    .references(() => labOrders.id, { onDelete: "cascade" }),

  recipientId: text("recipient_id")
    .notNull()
    .references(() => user.id),

  notificationType: varchar("notification_type", { length: 50 }).notNull(), // "result_ready", "critical_value", "order_cancelled"
  message: text("message").notNull(),

  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at", { withTimezone: true }),

  // Delivery channels
  sentViaEmail: boolean("sent_via_email").default(false),
  sentViaSms: boolean("sent_via_sms").default(false),
  sentViaApp: boolean("sent_via_app").default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Relations
 */
// Note: Relations will be defined in a separate file or added here based on Drizzle ORM patterns
