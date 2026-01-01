/**
 * Reset Database with UUID Migration
 * This script completely drops and recreates the database with UUID schema
 */

import { Pool } from "pg"
import "dotenv/config"

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"

async function resetDatabase() {
  console.log("🔄 Resetting database with UUID schema...")

  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    // Step 1: Drop all tables by dropping and recreating the schema
    console.log("📦 Dropping all existing tables...")

    await pool.query("DROP SCHEMA public CASCADE")
    await pool.query("CREATE SCHEMA public")
    await pool.query("GRANT ALL ON SCHEMA public TO postgres")
    await pool.query("GRANT ALL ON SCHEMA public TO public")

    console.log("✅ All tables dropped successfully")

    await pool.end()

    console.log("")
    console.log("🚀 Now run: npm run db:push")
    console.log("")
    console.log("📊 Migration Summary:")
    console.log("  - All tables will use UUID primary keys")
    console.log("  - All foreign keys will reference UUIDs")
    console.log("  - IDs generated via crypto.randomUUID()")
  } catch (error) {
    console.error("❌ Failed to reset database:", error)
    await pool.end()
    process.exit(1)
  }
}

resetDatabase()
