import {
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core"
import { medicalRecords } from "./medical-records"
import { visits } from "./visits"
import { user } from "./auth"

/**
 * Unified Inventory Items Table (table name: "drugs")
 * Master data for both drugs and materials
 *
 * Note: Table is still called "drugs" for backward compatibility,
 * but now contains both drugs and materials (distinguished by item_type)
 */
export const inventoryItems = pgTable("drugs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  genericName: varchar("generic_name", { length: 255 }), // For drugs only, NULL for materials

  // NEW: Item type classification
  itemType: varchar("item_type", { length: 50 }).notNull().default("drug"), // "drug" | "material"

  category: varchar("category", { length: 100 }),
  // Drugs: "Antibiotics", "Analgesics", "Antipyretics", etc.
  // Materials: "Consumables", "Dressings", "Medical Devices", etc.

  unit: varchar("unit", { length: 50 }).notNull(), // tablet, capsule, ml, pcs, box, roll, etc.
  // Basically, this price for prescriptions
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  // new for support old data schema
  generalPrice: decimal("general_price", { precision: 10, scale: 2 }),
  minimumStock: integer("minimum_stock").notNull().default(10), // Alert threshold
  description: text("description"),

  // NEW: Workflow flag
  requiresPrescription: boolean("requires_prescription").notNull().default(true),
  // TRUE for drugs (pharmacy workflow), FALSE for materials (nurse recording)

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// Alias for backward compatibility in code
export const drugs = inventoryItems

/**
 * Unified Inventory Batches Table (table name: "drug_inventory")
 * Tracks stock batches for all inventory items (drugs and materials)
 *
 * Note: Table is still called "drug_inventory" for backward compatibility,
 * but now contains batches for both drugs and materials
 */
export const inventoryBatches = pgTable("drug_inventory", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  drugId: text("drug_id") // Keep original column name for compatibility
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "cascade" }),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  receivedDate: timestamp("received_date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// Alias for backward compatibility in code
export const drugInventory = inventoryBatches

/**
 * Prescriptions Table
 * Digital prescriptions from doctors
 * Supports both OUTPATIENT (one-time) and INPATIENT (recurring) prescriptions
 *
 * References inventoryItems (drugs table) which now includes materials
 */
export const prescriptions = pgTable(
  "prescriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Medical record reference (can be outpatient consultation or inpatient progress note)
    medicalRecordId: text("medical_record_id").references(() => medicalRecords.id, {
      onDelete: "cascade",
    }),

    // Visit reference (for inpatient prescriptions)
    visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }),

    drugId: text("drug_id") // Keep original column name for compatibility
      .notNull()
      .references(() => inventoryItems.id),

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
    inventoryId: text("inventory_id").references(() => inventoryBatches.id), // Which batch was used

    // Pharmacist-added prescriptions (for urgent cases)
    addedByPharmacist: boolean("added_by_pharmacist").notNull().default(false),
    addedByPharmacistId: text("added_by_pharmacist_id").references(() => user.id),
    approvedBy: text("approved_by").references(() => user.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    pharmacistNote: text("pharmacist_note"),

    notes: text("notes"), // Pharmacist notes
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Performance indexes for pharmacy queue queries
    isFulfilledIdx: index("prescriptions_is_fulfilled_idx").on(table.isFulfilled),
    medicalRecordIdIdx: index("prescriptions_medical_record_id_idx").on(table.medicalRecordId),
    visitIdIdx: index("prescriptions_visit_id_idx").on(table.visitId),
    drugIdIdx: index("prescriptions_drug_id_idx").on(table.drugId),
    createdAtIdx: index("prescriptions_created_at_idx").on(table.createdAt),
    // Composite index for the most common pharmacy queue query
    fulfilledCreatedAtIdx: index("prescriptions_fulfilled_created_at_idx").on(
      table.isFulfilled,
      table.createdAt
    ),
  })
)

/**
 * Stock Movements Table
 * Track all inventory movements (in/out) for both drugs and materials
 */
export const stockMovements = pgTable("stock_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inventoryId: text("inventory_id")
    .notNull()
    .references(() => inventoryBatches.id, { onDelete: "cascade" }),
  movementType: varchar("movement_type", { length: 20 }).notNull(), // in, out, adjustment, expired
  quantity: integer("quantity").notNull(), // Positive for in, negative for out
  reason: text("reason"), // Reason for movement
  referenceId: text("reference_id"), // Reference to prescription/visit if type is "out"
  performedBy: text("performed_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
