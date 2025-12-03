import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { user } from "./auth"

/**
 * Roles Table
 * Define user roles for RBAC (Role-Based Access Control)
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // admin, doctor, nurse, pharmacist, cashier, receptionist
  description: text("description"),
  permissions: text("permissions"), // JSON array of permissions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/**
 * User Roles Table
 * Many-to-many relationship between users and roles
 */
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roleId: serial("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: text("assigned_by").references(() => user.id),
})
