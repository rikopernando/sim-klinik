/**
 * Script to migrate username field
 * Adds username column, populates it, and adds constraints
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";

async function migrateUsername() {
    console.log("📝 Starting username migration...");

    try {
        // Step 1: Add username column without NOT NULL constraint
        console.log("Step 1: Adding username column...");
        await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" text`);

        // Step 2: Update existing users with username from email
        console.log("Step 2: Populating usernames from email...");
        await db.execute(sql`UPDATE "user" SET "username" = SPLIT_PART("email", '@', 1) WHERE "username" IS NULL`);

        // Step 3: Make username NOT NULL
        console.log("Step 3: Making username NOT NULL...");
        await db.execute(sql`ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL`);

        // Step 4: Add unique constraint (check if exists first)
        console.log("Step 4: Adding unique constraint...");
        try {
            await db.execute(sql`ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username")`);
        } catch (error: unknown) {
            // Constraint already exists, ignore error
            const err = error as { code?: string };
            if (err.code !== '42P07') { // 42P07 = duplicate object error
                throw error;
            }
            console.log("Constraint already exists, skipping...");
        }

        console.log("✅ Username migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

migrateUsername()
    .then(() => {
        console.log("Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
