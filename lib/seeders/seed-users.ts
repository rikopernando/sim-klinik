/**
 * Database Seeder for Demo Users
 * Seeds demo users with different roles for testing
 */

import { db } from "@/db"
import { user } from "@/db/schema/auth"
import { userRoles } from "@/db/schema/roles"
import { USER_ROLES } from "@/types/rbac"
import { eq } from "drizzle-orm"
import { getRoleIdByName } from "./seed-roles"
import { auth } from "@/lib/auth"

// For demo purposes, all users will have password: "password123"
// In production, users should set their own passwords
const DEFAULT_PASSWORD = "password123"

interface DemoUser {
  name: string
  email: string
  role: string
}

const DEMO_USERS: DemoUser[] = [
  {
    name: "Super Admin",
    email: "superadmin@simklinik.test",
    role: USER_ROLES.SUPER_ADMIN,
  },
  {
    name: "Admin User",
    email: "admin@simklinik.test",
    role: USER_ROLES.ADMIN,
  },
  {
    name: "Dr. Ahmad Wijaya",
    email: "doctor@simklinik.test",
    role: USER_ROLES.DOCTOR,
  },
  {
    name: "Dr. Siti Nurhaliza",
    email: "doctor2@simklinik.test",
    role: USER_ROLES.DOCTOR,
  },
  {
    name: "Ns. Budi Santoso",
    email: "nurse@simklinik.test",
    role: USER_ROLES.NURSE,
  },
  {
    name: "Ns. Indah Permata",
    email: "nurse2@simklinik.test",
    role: USER_ROLES.NURSE,
  },
  {
    name: "Apt. Rudi Hartono",
    email: "pharmacist@simklinik.test",
    role: USER_ROLES.PHARMACIST,
  },
  {
    name: "Dewi Lestari",
    email: "cashier@simklinik.test",
    role: USER_ROLES.CASHIER,
  },
  {
    name: "Fitri Handayani",
    email: "receptionist@simklinik.test",
    role: USER_ROLES.RECEPTIONIST,
  },
]

/**
 * Seed demo users with passwords
 * Default password for all demo users: "password123"
 */
export async function seedUsers() {
  console.log("🌱 Seeding demo users...")
  console.log(`   Default password: "${DEFAULT_PASSWORD}"`)

  for (const demoUser of DEMO_USERS) {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, demoUser.email))
      .limit(1)

    if (existingUser) {
      console.log(`  ✓ User "${demoUser.email}" already exists, skipping...`)
      continue
    }

    console.log(`  + Creating user "${demoUser.email}" (${demoUser.name})...`)

    // Use Better Auth API to create user with password
    const result = await auth.api.signUpEmail({
      body: {
        email: demoUser.email,
        password: DEFAULT_PASSWORD,
        name: demoUser.name,
      },
    })

    if (!result || !result.user) {
      console.error(`    ✗ Failed to create user!`)
      continue
    }

    console.log(`    → User created with password`)

    // Assign role
    const roleId = await getRoleIdByName(demoUser.role)

    if (roleId) {
      await db.insert(userRoles).values({
        userId: result.user.id,
        roleId: roleId,
        assignedBy: null, // System assigned
      })
      console.log(`    → Assigned role: ${demoUser.role}`)
    } else {
      console.error(`    ✗ Role "${demoUser.role}" not found!`)
    }
  }

  console.log("✅ Demo users seeded successfully!")
  console.log("\n📝 Demo User Credentials:")
  console.log("   ========================================")
  console.log("   Email: superadmin@simklinik.test")
  console.log("   Email: admin@simklinik.test")
  console.log("   Email: doctor@simklinik.test")
  console.log("   Email: doctor2@simklinik.test")
  console.log("   Email: nurse@simklinik.test")
  console.log("   Email: nurse2@simklinik.test")
  console.log("   Email: pharmacist@simklinik.test")
  console.log("   Email: cashier@simklinik.test")
  console.log("   Email: receptionist@simklinik.test")
  console.log(`   Password (all): ${DEFAULT_PASSWORD}`)
  console.log("   ========================================")
}
