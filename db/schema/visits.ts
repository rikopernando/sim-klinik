import { pgTable, varchar, timestamp, text, index } from "drizzle-orm/pg-core"
import { patients } from "./patients"
import { user } from "./auth"

/**
 * Visits Table
 * Tracks patient visits/encounters across all service types
 */
export const visits = pgTable(
  "visits",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    visitType: varchar("visit_type", { length: 20 }).notNull(), // outpatient, inpatient, emergency
    visitNumber: varchar("visit_number", { length: 30 }).notNull().unique(), // Auto-generated visit identifier

    // For outpatient
    poliId: text("poli_id"), // Reference to poli/department (will create polis table)
    doctorId: text("doctor_id").references(() => user.id), // Assigned doctor
    queueNumber: varchar("queue_number", { length: 10 }), // Queue number for outpatient

    // For emergency
    triageStatus: varchar("triage_status", { length: 20 }), // red, yellow, green
    chiefComplaint: text("chief_complaint"), // Main complaint (required for ER)

    // For inpatient
    roomId: text("room_id"), // Reference to room (will create rooms table)
    admissionDate: timestamp("admission_date"),
    dischargeDate: timestamp("discharge_date"),

    // Common fields
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, registered, waiting, in_examination, examined, ready_for_billing, billed, paid, completed, cancelled
    arrivalTime: timestamp("arrival_time").defaultNow().notNull(),
    startTime: timestamp("start_time"), // When consultation/treatment starts
    endTime: timestamp("end_time"), // When visit is completed

    // Disposition (especially for ER)
    disposition: varchar("disposition", { length: 50 }), // discharged, admitted, referred, died

    notes: text("notes"), // General notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Performance indexes for common query patterns
    statusIdx: index("visits_status_idx").on(table.status),
    patientIdIdx: index("visits_patient_id_idx").on(table.patientId),
    doctorIdIdx: index("visits_doctor_id_idx").on(table.doctorId),
    poliIdIdx: index("visits_poli_id_idx").on(table.poliId),
    createdAtIdx: index("visits_created_at_idx").on(table.createdAt),
    arrivalTimeIdx: index("visits_arrival_time_idx").on(table.arrivalTime),
    // Composite indexes for common query patterns
    doctorStatusIdx: index("visits_doctor_status_idx").on(table.doctorId, table.status),
    poliStatusIdx: index("visits_poli_status_idx").on(table.poliId, table.status),
    // Composite index for date-filtered queue queries
    arrivalTimeStatusIdx: index("visits_arrival_time_status_idx").on(table.arrivalTime, table.status),
    visitTypeArrivalIdx: index("visits_visit_type_arrival_idx").on(table.visitType, table.arrivalTime),
  })
)

/**
 * Polis/Departments Table
 * Master data for clinic departments/poli
 */
export const polis = pgTable("polis", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Poli Umum", "Poli Gigi", "Poli Anak"
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description").notNull(),
  isActive: varchar("is_active", { length: 10 }).notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // updatedAt: timestamp("update_at").defaultNow().notNull(),
})
