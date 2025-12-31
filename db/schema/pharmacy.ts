import { pgTable, varchar, text, timestamp, decimal, boolean, integer } from "drizzle-orm/pg-core"
import { medicalRecords, cppt } from "./medical-records"
import { visits } from "./visits"
import { user } from "./auth"

/**
 * Drugs Master Table
 * Master data for all medications
 */
export const drugs = pgTable("drugs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  genericName: varchar("generic_name", { length: 255 }),
  category: varchar("category", { length: 100 }), // Antibiotics, Analgesics, etc.
  unit: varchar("unit", { length: 50 }).notNull(), // tablet, capsule, ml, mg, etc.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minimumStock: integer("minimum_stock").notNull().default(10), // Alert threshold
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Drug Inventory Table
 * Tracks drug stock with batch numbers and expiry dates
 */
export const drugInventory = pgTable("drug_inventory", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  drugId: text("drug_id")
    .notNull()
    .references(() => drugs.id, { onDelete: "cascade" }),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  receivedDate: timestamp("received_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Prescriptions Table
 * Digital prescriptions from doctors
 * Supports both OUTPATIENT (one-time) and INPATIENT (recurring) prescriptions
 */
export const prescriptions = pgTable("prescriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // OUTPATIENT reference (one-time prescription)
  medicalRecordId: text("medical_record_id").references(() => medicalRecords.id, {
    onDelete: "cascade",
  }),

  // INPATIENT references (daily/recurring medications)
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }),
  cpptId: text("cppt_id").references(() => cppt.id), // Optional - which CPPT entry ordered it

  drugId: text("drug_id")
    .notNull()
    .references(() => drugs.id),

  // Prescription details
  dosage: varchar("dosage", { length: 100 }), // e.g., "500mg"
  frequency: varchar("frequency", { length: 100 }).notNull(), // e.g., "3x daily", "After meals"
  duration: varchar("duration", { length: 100 }), // e.g., "7 days", "Until finished"
  quantity: integer("quantity").notNull(), // Total quantity to dispense

  // Instructions
  instructions: text("instructions"), // Additional instructions for patient
  route: varchar("route", { length: 50 }), // oral, topical, injection, etc.

  // INPATIENT specific fields
  isRecurring: boolean("is_recurring").notNull().default(false), // Daily medication for inpatient
  startDate: timestamp("start_date", { withTimezone: true }), // When to start (inpatient)
  endDate: timestamp("end_date", { withTimezone: true }), // When to stop (inpatient)
  administrationSchedule: text("administration_schedule"), // "08:00,14:00,20:00" for 3x daily

  // Administration tracking (for nurses - inpatient)
  isAdministered: boolean("is_administered").notNull().default(false),
  administeredBy: text("administered_by").references(() => user.id), // Nurse who gave medication
  administeredAt: timestamp("administered_at", { withTimezone: true }),

  // Fulfillment tracking (pharmacy)
  isFulfilled: boolean("is_fulfilled").notNull().default(false),
  fulfilledBy: text("fulfilled_by").references(() => user.id), // Pharmacist who fulfilled
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  dispensedQuantity: integer("dispensed_quantity"), // Actual quantity dispensed

  // Stock tracking
  inventoryId: text("inventory_id").references(() => drugInventory.id), // Which batch was used

  // Pharmacist-added prescriptions (for urgent cases)
  addedByPharmacist: boolean("added_by_pharmacist").notNull().default(false),
  addedByPharmacistId: text("added_by_pharmacist_id").references(() => user.id),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  pharmacistNote: text("pharmacist_note"),

  notes: text("notes"), // Pharmacist notes
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Stock Movements Table
 * Track all inventory movements (in/out)
 */
export const stockMovements = pgTable("stock_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inventoryId: text("inventory_id")
    .notNull()
    .references(() => drugInventory.id, { onDelete: "cascade" }),
  movementType: varchar("movement_type", { length: 20 }).notNull(), // in, out, adjustment, expired
  quantity: integer("quantity").notNull(), // Positive for in, negative for out
  reason: text("reason"), // Reason for movement
  referenceId: text("reference_id"), // Reference to prescription if type is "out"
  performedBy: text("performed_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
