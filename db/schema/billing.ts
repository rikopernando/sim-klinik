import { pgTable, varchar, text, timestamp, decimal, boolean, integer } from "drizzle-orm/pg-core"
import { visits } from "./visits"
import { user } from "./auth"

/**
 * Services Master Table
 * Master data for all billable services
 */
export const services = pgTable("services", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // consultation, procedure, room, laboratory, radiology, etc.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Grouping for reports
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Billings Table
 * Main billing record for each visit
 */
export const billings = pgTable("billings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .unique() // One billing per visit
    .references(() => visits.id, { onDelete: "cascade" }),

  // Billing amounts
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  tax: decimal("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),

  // Insurance/coverage
  insuranceCoverage: decimal("insurance_coverage", { precision: 12, scale: 2 }).default("0"),
  patientPayable: decimal("patient_payable", { precision: 12, scale: 2 }).notNull(), // Amount patient must pay

  // Payment tracking
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, partial, paid
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }),

  // Payment details
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, transfer, card, insurance
  paymentReference: varchar("payment_reference", { length: 100 }), // Transaction reference number

  // Cashier info
  processedBy: text("processed_by").references(() => user.id),
  processedAt: timestamp("processed_at"),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Billing Items Table
 * Individual line items in a bill
 */
export const billingItems = pgTable("billing_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  billingId: text("billing_id")
    .notNull()
    .references(() => billings.id, { onDelete: "cascade" }),

  // Item details
  itemType: varchar("item_type", { length: 50 }).notNull(), // service, drug, material, room
  itemId: text("item_id"), // Reference to services, drugs, etc.
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemCode: varchar("item_code", { length: 50 }),

  // Pricing
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),

  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/**
 * Payments Table
 * Track payment transactions (supports partial payments)
 */
export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  billingId: text("billing_id")
    .notNull()
    .references(() => billings.id, { onDelete: "cascade" }),

  // Payment details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, transfer, card
  paymentReference: varchar("payment_reference", { length: 100 }),

  // Cash handling
  amountReceived: decimal("amount_received", { precision: 12, scale: 2 }), // For cash payments
  changeGiven: decimal("change_given", { precision: 12, scale: 2 }), // For cash payments

  // Tracking
  receivedBy: text("received_by")
    .notNull()
    .references(() => user.id),
  receivedAt: timestamp("received_at").defaultNow().notNull(),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/**
 * Discharge Summaries Table
 * Medical summary for patient discharge (especially inpatient)
 */
export const dischargeSummaries = pgTable("discharge_summaries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .unique()
    .references(() => visits.id, { onDelete: "cascade" }),

  // Summary content
  admissionDiagnosis: text("admission_diagnosis").notNull(),
  dischargeDiagnosis: text("discharge_diagnosis").notNull(),
  clinicalSummary: text("clinical_summary").notNull(), // Course of treatment in hospital
  proceduresPerformed: text("procedures_performed"),
  medicationsOnDischarge: text("medications_on_discharge"), // Medications to continue at home

  // Follow-up
  dischargeInstructions: text("discharge_instructions").notNull(),
  dietaryRestrictions: text("dietary_restrictions"),
  activityRestrictions: text("activity_restrictions"),
  followUpDate: timestamp("follow_up_date"),
  followUpInstructions: text("follow_up_instructions"),

  // Doctor info
  dischargedBy: text("discharged_by")
    .notNull()
    .references(() => user.id),
  dischargedAt: timestamp("discharged_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
