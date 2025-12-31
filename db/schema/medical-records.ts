import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core"
import { visits } from "./visits"
import { user } from "./auth"
import { services } from "./billing"

/**
 * Medical Records Table
 * Electronic Medical Record (EMR) using SOAP format
 */
export const medicalRecords = pgTable("medical_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .unique() // One medical record per visit
    .references(() => visits.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => user.id),

  // SOAP Notes
  soapSubjective: text("soap_subjective"), // Patient's complaints and history
  soapObjective: text("soap_objective"), // Physical examination findings, vital signs
  soapAssessment: text("soap_assessment"), // Clinical diagnosis and analysis
  soapPlan: text("soap_plan"), // Treatment plan and recommendations

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

  // OUTPATIENT reference (done during visit)
  medicalRecordId: text("medical_record_id").references(() => medicalRecords.id, {
    onDelete: "cascade",
  }),

  // INPATIENT references (ordered procedures)
  visitId: text("visit_id").references(() => visits.id, { onDelete: "cascade" }),
  cpptId: text("cppt_id").references(() => cppt.id), // Optional - which CPPT entry ordered it

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
 * CPPT (Catatan Perkembangan Pasien Terintegrasi)
 * Integrated Progress Notes - for inpatient care
 */
export const cppt = pgTable("cppt", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitId: text("visit_id")
    .notNull()
    .references(() => visits.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  authorRole: text("author_role").notNull(), // doctor, nurse

  // SOAP for daily progress
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),

  progressNote: text("progress_note").notNull(), // General progress note
  instructions: text("instructions"), // Instructions for nursing staff

  createdAt: timestamp("created_at").defaultNow().notNull(),
})
