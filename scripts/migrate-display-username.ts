/**
 * Script to add displayUsername field
 */

import { sql } from "drizzle-orm"
import { db } from "@/db"

async function migrateDisplayUsername() {
  console.log("📝 Adding displayUsername field...")

  try {
    // Add displayUsername column
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "display_username" text`)

    console.log("✅ displayUsername field added successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

migrateDisplayUsername()
  .then(() => {
    console.log("Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
