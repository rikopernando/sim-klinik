import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

export const db = drizzle(process.env.DATABASE_URL!, { schema })

// Export type for database instance and transactions
export type DbClient = typeof db
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
