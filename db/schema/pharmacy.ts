import { pgTable, serial, integer, varchar, text, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { medicalRecords } from "./medical-records";
import { user } from "./auth";

/**
 * Drugs Master Table
 * Master data for all medications
 */
export const drugs = pgTable("drugs", {
    id: serial("id").primaryKey(),
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
});

/**
 * Drug Inventory Table
 * Tracks drug stock with batch numbers and expiry dates
 */
export const drugInventory = pgTable("drug_inventory", {
    id: serial("id").primaryKey(),
    drugId: integer("drug_id")
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
});

/**
 * Prescriptions Table
 * Digital prescriptions from doctors
 */
export const prescriptions = pgTable("prescriptions", {
    id: serial("id").primaryKey(),
    medicalRecordId: integer("medical_record_id")
        .notNull()
        .references(() => medicalRecords.id, { onDelete: "cascade" }),
    drugId: integer("drug_id")
        .notNull()
        .references(() => drugs.id),

    // Prescription details
    dosage: varchar("dosage", { length: 100 }), // e.g., "500mg" - Optional per feedback 4.5 (often in drug name)
    frequency: varchar("frequency", { length: 100 }).notNull(), // e.g., "3x daily", "After meals"
    duration: varchar("duration", { length: 100 }), // e.g., "7 days", "Until finished" - Removed per feedback 4.7
    quantity: integer("quantity").notNull(), // Total quantity to dispense

    // Instructions
    instructions: text("instructions"), // Additional instructions for patient
    route: varchar("route", { length: 50 }), // oral, topical, injection, etc.

    // Fulfillment tracking
    isFulfilled: boolean("is_fulfilled").notNull().default(false),
    fulfilledBy: text("fulfilled_by").references(() => user.id), // Pharmacist who fulfilled
    fulfilledAt: timestamp("fulfilled_at"),
    dispensedQuantity: integer("dispensed_quantity"), // Actual quantity dispensed

    // Stock tracking
    inventoryId: integer("inventory_id").references(() => drugInventory.id), // Which batch was used

    // Pharmacist-added prescriptions (for urgent cases)
    addedByPharmacist: boolean("added_by_pharmacist").notNull().default(false), // Flag for pharmacist-added prescriptions
    addedByPharmacistId: text("added_by_pharmacist_id").references(() => user.id), // Which pharmacist added it
    approvedBy: text("approved_by").references(() => user.id), // Doctor who approved
    approvedAt: timestamp("approved_at"), // When approved
    pharmacistNote: text("pharmacist_note"), // Reason for adding prescription

    notes: text("notes"), // Pharmacist notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Stock Movements Table
 * Track all inventory movements (in/out)
 */
export const stockMovements = pgTable("stock_movements", {
    id: serial("id").primaryKey(),
    inventoryId: integer("inventory_id")
        .notNull()
        .references(() => drugInventory.id, { onDelete: "cascade" }),
    movementType: varchar("movement_type", { length: 20 }).notNull(), // in, out, adjustment, expired
    quantity: integer("quantity").notNull(), // Positive for in, negative for out
    reason: text("reason"), // Reason for movement
    referenceId: integer("reference_id"), // Reference to prescription if type is "out"
    performedBy: text("performed_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
