/**
 * Script to add usernames to existing users
 * Run this before applying the username migration
 */

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

async function addUsernames() {
    console.log("📝 Adding usernames to existing users...");

    // Get all users without username
    const users = await db.select().from(user);

    for (const u of users) {
        // Generate username from email (part before @)
        const username = u.email.split("@")[0];

        console.log(`Adding username "${username}" to user ${u.email}`);

        await db
            .update(user)
            .set({ username })
            .where(eq(user.id, u.id));
    }

    console.log(`✅ Successfully added usernames to ${users.length} users`);
}

addUsernames()
    .then(() => {
        console.log("Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
