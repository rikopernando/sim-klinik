import { pgTable, varchar, text, timestamp, decimal, integer } from "drizzle-orm/pg-core"
import { visits } from "./visits"
import { user } from "./auth"
import { services } from "./billing"

/**
 * Rooms Table
 * Hospital rooms and bed management
 */
export const rooms = pgTable("rooms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roomNumber: varchar("room_number", { length: 20 }).notNull().unique(),
  roomType: varchar("room_type", { length: 50 }).notNull(), // VIP, Class 1, Class 2, ICU, etc.
  bedCount: integer("bed_count").notNull().default(1),
  availableBeds: integer("available_beds").notNull().default(1),
  floor: varchar("floor", { length: 20 }),
  building: varchar("building", { length: 50 }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(), // Cost per day
  facilities: text("facilities"), // AC, TV, Private bathroom, etc.
  status: varchar("status", { length: 20 }).notNull().default("available"), // available, occupied, maintenance, reserved
  description: text("description"),
  isActive: varchar("is_active", { length: 10 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Vitals History Table
 * Track patient vital signs over time (especially for inpatient)
 */
export const vitalsHistory = pgTable("vitals_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),

  // Vital signs
  temperature: decimal("temperature", { precision: 4, scale: 2 }), // Celsius
  bloodPressureSystolic: integer("blood_pressure_systolic"), // mmHg
  bloodPressureDiastolic: integer("blood_pressure_diastolic"), // mmHg
  pulse: integer("pulse"), // beats per minute
  respiratoryRate: integer("respiratory_rate"), // breaths per minute
  oxygenSaturation: decimal("oxygen_saturation", { precision: 5, scale: 2 }), // SpO2 percentage
  weight: decimal("weight", { precision: 5, scale: 2 }), // kg
  height: decimal("height", { precision: 5, scale: 2 }), // cm
  bmi: decimal("bmi", { precision: 5, scale: 2 }), // Body Mass Index (calculated)

  // Additional measurements
  painScale: integer("pain_scale"), // 0-10 pain scale
  consciousness: varchar("consciousness", { length: 50 }), // Alert, Confused, Drowsy, Unresponsive

  // Tracking
  recordedBy: text("recorded_by")
    .notNull()
    .references(() => user.id), // Nurse or doctor
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Bed Assignments Table
 * Track patient bed assignments for inpatient care
 */
export const bedAssignments = pgTable("bed_assignments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id),
  bedNumber: varchar("bed_number", { length: 10 }).notNull(), // Bed identifier within room
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
  dischargedAt: timestamp("discharged_at", { withTimezone: true }),
  assignedBy: text("assigned_by").references(() => user.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Material Usage Table
 * Track medical materials/supplies used for inpatient care
 */
export const materialUsage = pgTable("material_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),

  // Service reference (NEW - preferred approach)
  serviceId: text("service_id").references(() => services.id),

  // Legacy fields (kept for backward compatibility, will be deprecated)
  materialName: varchar("material_name", { length: 255 }),
  unit: varchar("unit", { length: 50 }), // pcs, box, unit, etc.
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),

  // Core fields
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  usedBy: text("used_by").references(() => user.id), // Staff who used the material
  usedAt: timestamp("used_at", { withTimezone: true }).defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
