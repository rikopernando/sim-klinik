/**
 * Main Database Seeder
 * Run all seeders in correct order
 */

import { seedRoles } from "./seed-roles";
import { seedUsers } from "./seed-users";
import { seedPolis } from "./seed-polis";

export async function runAllSeeders() {
    console.log("🚀 Starting database seeding...\n");

    try {
        // 1. Seed roles first (users depend on roles)
        await seedRoles();
        console.log("");

        // 2. Seed users with role assignments
        await seedUsers();
        console.log("");

        // 3. Seed polis/departments (master data)
        await seedPolis();
        console.log("");

        console.log("🎉 All seeders completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}

// Export individual seeders
export { seedRoles } from "./seed-roles";
export { seedUsers } from "./seed-users";
export { seedPolis } from "./seed-polis";
