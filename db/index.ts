import "dotenv/config"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

// Use the Supabase connection string if available, otherwise fallback to local database
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("Either SUPABASE_DATABASE_URL or DATABASE_URL must be set")
}

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

// Export type for database instance and transactions
export type DbClient = typeof db
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
