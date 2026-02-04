/**
 * ICD-10 Schema
 * Master data for ICD-10 diagnosis codes
 */

import { pgTable, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

export const icd10Codes = pgTable(
  "icd10_codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 10 }).notNull().unique(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index("icd10_code_idx").on(table.code),
    descriptionIdx: index("icd10_description_idx").on(table.description),
  })
)

export type ICD10Code = typeof icd10Codes.$inferSelect
export type NewICD10Code = typeof icd10Codes.$inferInsert
