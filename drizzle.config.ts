import "dotenv/config"
import { defineConfig } from "drizzle-kit"

// Use Supabase database URL if available, otherwise fallback to local database
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("Either SUPABASE_DATABASE_URL or DATABASE_URL must be set")
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
  },
})
