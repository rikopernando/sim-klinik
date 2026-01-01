/**
 * Central export for all database schemas
 * Import this file to access all table definitions
 */

// Auth schemas
export * from "./auth"

// User management
export * from "./roles"

// Patient management
export * from "./patients"
export * from "./visits"

// Medical records
export * from "./medical-records"

// ICD-10 Codes
export * from "./icd10"

// Inventory (unified drugs and materials - previously "pharmacy")
export * from "./inventory"

// Inpatient care
export * from "./inpatient"

// Billing
export * from "./billing"
