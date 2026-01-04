import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core"
import { visits } from "./visits"
import { user } from "./auth"
import { services } from "./billing"

/**
 * Medical Records Table (Unified)
 * Stores all clinical documentation for both outpatient and inpatient care
 *
 * Record Types:
 * - initial_consultation: Outpatient visit (locked after completion)
 * - progress_note: Inpatient daily CPPT (editable within 2 hours)
 * - discharge_summary: Final discharge documentation (locked)
 * - procedure_note: Standalone procedure documentation
 * - specialist_consultation: Specialist consult notes
 */
export const medicalRecords = pgTable("medical_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  // Note: visitId is NOT unique - multiple records per visit allowed (inpatient progress notes)

  // Author information
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  authorRole: varchar("author_role", { length: 20 }).notNull(), // doctor, nurse, specialist

  // Record type - determines workflow and locking behavior
  recordType: varchar("record_type", { length: 30 })
    .notNull()
    .default("initial_consultation"), // initial_consultation, progress_note, discharge_summary, procedure_note, specialist_consultation

  // SOAP Notes
  soapSubjective: text("soap_subjective"), // Patient's complaints and history
  soapObjective: text("soap_objective"), // Physical examination findings, vital signs
  soapAssessment: text("soap_assessment"), // Clinical diagnosis and analysis
  soapPlan: text("soap_plan"), // Treatment plan and recommendations

  // Progress documentation (primarily for inpatient progress notes)
  progressNote: text("progress_note"), // General progress note (can be used for any record type)
  instructions: text("instructions"), // Instructions for nursing staff or follow-up

  // Additional clinical notes
  physicalExam: text("physical_exam"), // Detailed physical examination
  laboratoryResults: text("laboratory_results"), // Lab test results
  radiologyResults: text("radiology_results"), // Radiology findings

  // Record status
  isLocked: boolean("is_locked").notNull().default(false), // Once locked, cannot be edited
  isDraft: boolean("is_draft").notNull().default(true), // Draft status

  // Timestamps
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * Diagnoses Table
 * ICD-10 diagnoses linked to medical records
 */
export const diagnoses = pgTable("diagnoses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  medicalRecordId: text("medical_record_id")
    .notNull()
    .references(() => medicalRecords.id, { onDelete: "cascade" }),
  icd10Code: text("icd10_code").notNull(), // ICD-10 code
  description: text("description").notNull(), // Diagnosis description
  diagnosisType: text("diagnosis_type").notNull().default("primary"), // primary, secondary
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/**
 * Procedures Table
 * Medical procedures/actions performed
 * Supports both OUTPATIENT (done during visit) and INPATIENT (ordered and scheduled)
 */
export const procedures = pgTable("procedures", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Medical record reference (can be outpatient consultation or inpatient progress note)
  medicalRecordId: text("medical_record_id").references(() => medicalRecords.id, {
    onDelete: "cascade",
  }),

  // Visit reference (for inpatient procedures)
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }),

  serviceId: text("service_id").references(() => services.id), // Reference to services table
  icd9Code: text("icd9_code"), // ICD-9-CM procedure code (optional)
  description: text("description").notNull(), // Procedure description

  // INPATIENT specific - ordering workflow
  orderedBy: text("ordered_by").references(() => user.id), // Doctor who ordered (inpatient)
  orderedAt: timestamp("ordered_at", { withTimezone: true }), // When ordered (inpatient)
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }), // When scheduled to perform
  status: varchar("status", { length: 20 }).default("ordered"), // ordered, in_progress, completed, cancelled

  // Execution tracking
  performedBy: text("performed_by").references(() => user.id),
  performedAt: timestamp("performed_at", { withTimezone: true }),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

/**
 * DEPRECATED: CPPT table has been merged into medical_records
 * All inpatient progress notes are now stored as medical_records with recordType='progress_note'
 *
 * Migration: All cppt records have been migrated to medical_records table
 */
