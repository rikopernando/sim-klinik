import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { visits } from "./visits";
import { user } from "./auth";

/**
 * Medical Records Table
 * Electronic Medical Record (EMR) using SOAP format
 */
export const medicalRecords = pgTable("medical_records", {
    id: serial("id").primaryKey(),
    visitId: integer("visit_id")
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
});

/**
 * Diagnoses Table
 * ICD-10 diagnoses linked to medical records
 */
export const diagnoses = pgTable("diagnoses", {
    id: serial("id").primaryKey(),
    medicalRecordId: integer("medical_record_id")
        .notNull()
        .references(() => medicalRecords.id, { onDelete: "cascade" }),
    icd10Code: text("icd10_code").notNull(), // ICD-10 code
    description: text("description").notNull(), // Diagnosis description
    diagnosisType: text("diagnosis_type").notNull().default("primary"), // primary, secondary
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Procedures Table
 * ICD-9 procedures/actions performed
 */
export const procedures = pgTable("procedures", {
    id: serial("id").primaryKey(),
    medicalRecordId: integer("medical_record_id")
        .notNull()
        .references(() => medicalRecords.id, { onDelete: "cascade" }),
    icd9Code: text("icd9_code").notNull(), // ICD-9-CM procedure code
    description: text("description").notNull(), // Procedure description
    performedBy: text("performed_by").references(() => user.id),
    performedAt: timestamp("performed_at").defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * CPPT (Catatan Perkembangan Pasien Terintegrasi)
 * Integrated Progress Notes - for inpatient care
 */
export const cppt = pgTable("cppt", {
    id: serial("id").primaryKey(),
    visitId: integer("visit_id")
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
});
