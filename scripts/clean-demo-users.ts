/**
 * Clean Demo Users
 * Removes all demo users from the database
 */

import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { like } from "drizzle-orm"

async function cleanDemoUsers() {
  console.log("=".repeat(50))
  console.log("  Cleaning Demo Users")
  console.log("=".repeat(50))
  console.log("")

  // Delete all users with @simklinik.test email
  const result = await db.delete(user).where(like(user.email, "%@simklinik.test")).returning()

  console.log(`✅ Deleted ${result.length} demo users`)
  console.log("")

  result.forEach((u) => {
    console.log(`  - ${u.email}`)
  })

  console.log("")
  console.log("=".repeat(50))
}

cleanDemoUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
