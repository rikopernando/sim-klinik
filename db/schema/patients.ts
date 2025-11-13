import { pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

/**
 * Patients Table
 * Stores core patient demographic information
 */
export const patients = pgTable("patients", {
    id: serial("id").primaryKey(),
    mrNumber: varchar("mr_number", { length: 20 }).notNull().unique(), // Medical Record Number (auto-generated)
    nik: varchar("nik", { length: 16 }).unique(), // National ID Number (Nomor Induk Kependudukan)
    name: varchar("name", { length: 255 }).notNull(),
    dateOfBirth: timestamp("date_of_birth"),
    gender: varchar("gender", { length: 10 }), // male, female, other
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    insuranceType: varchar("insurance_type", { length: 50 }), // BPJS, Asuransi Swasta, Umum/Cash
    insuranceNumber: varchar("insurance_number", { length: 50 }),
    emergencyContact: varchar("emergency_contact", { length: 255 }),
    emergencyPhone: varchar("emergency_phone", { length: 20 }),
    bloodType: varchar("blood_type", { length: 5 }), // A, B, AB, O with +/-
    allergies: text("allergies"), // Comma-separated or JSON
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
