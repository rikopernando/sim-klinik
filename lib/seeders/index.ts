/**
 * Main Database Seeder
 * Run all seeders in correct order
 */

import { seedRoles } from "./seed-roles"
import { seedUsers } from "./seed-users"
import { seedPolis } from "./seed-polis"
import { seedServices } from "./seed-services"
import { seedDrugs } from "./seed-drugs"
import { seedICD10 } from "./seed-icd10"

export async function runAllSeeders() {
  console.log("🚀 Starting database seeding...\n")

  try {
    // 1. Seed roles first (users depend on roles)
    await seedRoles()
    console.log("")

    // 2. Seed users with role assignments
    await seedUsers()
    console.log("")

    // 3. Seed polis/departments (master data)
    await seedPolis()
    console.log("")

    // 4. Seed services (master data for billing)
    await seedServices()
    console.log("")

    // 5. Seed drugs (master data for pharmacy)
    await seedDrugs()
    console.log("")

    // 6. Seed ICD 10 (master data for dianosis)
    await seedICD10()
    console.log("")

    console.log("🎉 All seeders completed successfully!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    throw error
  }
}

// Export individual seeders
export { seedRoles } from "./seed-roles"
export { seedUsers } from "./seed-users"
export { seedPolis } from "./seed-polis"
export { seedServices } from "./seed-services"
export { seedDrugs } from "./seed-drugs"
