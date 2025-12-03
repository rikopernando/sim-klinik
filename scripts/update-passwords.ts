/**
 * Update Passwords for Existing Users
 * Adds password to users created without passwords
 */

import { db } from "@/db"
import { user, account } from "@/db/schema/auth"
import { eq } from "drizzle-orm"
import { hash } from "bcrypt"

const DEFAULT_PASSWORD = "password123"

async function updatePasswords() {
  console.log("=".repeat(50))
  console.log("  Updating User Passwords")
  console.log("=".repeat(50))
  console.log("")

  console.log(`Setting password to: "${DEFAULT_PASSWORD}"`)
  console.log("")

  // Get all users
  const allUsers = await db.select().from(user)

  for (const currentUser of allUsers) {
    console.log(`Processing: ${currentUser.email}...`)

    // Check if account already exists
    const [existingAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, currentUser.id))
      .limit(1)

    if (existingAccount) {
      // Update existing account with new password
      const hashedPassword = await hash(DEFAULT_PASSWORD, 10)
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.userId, currentUser.id))
      console.log(`  ✓ Password updated`)
    } else {
      // Create new account with password
      const hashedPassword = await hash(DEFAULT_PASSWORD, 10)
      const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await db.insert(account).values({
        id: accountId,
        accountId: currentUser.email,
        providerId: "credential",
        userId: currentUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`  ✓ Account created with password`)
    }
  }

  console.log("")
  console.log("✅ All passwords updated!")
  console.log("")
  console.log("=".repeat(50))
}

updatePasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
