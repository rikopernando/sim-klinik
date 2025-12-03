/**
 * Database Seeder for Roles
 * Seeds default roles into the database
 */

import { db } from "@/db"
import { roles } from "@/db/schema/roles"
import { ROLE_PERMISSIONS, USER_ROLES, ROLE_INFO } from "@/types/rbac"
import { eq } from "drizzle-orm"

/**
 * Seed all default roles
 */
export async function seedRoles() {
  console.log("🌱 Seeding roles...")

  const rolesToSeed = [
    {
      name: USER_ROLES.SUPER_ADMIN,
      description: ROLE_INFO.super_admin.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.super_admin),
    },
    {
      name: USER_ROLES.ADMIN,
      description: ROLE_INFO.admin.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.admin),
    },
    {
      name: USER_ROLES.DOCTOR,
      description: ROLE_INFO.doctor.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.doctor),
    },
    {
      name: USER_ROLES.NURSE,
      description: ROLE_INFO.nurse.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.nurse),
    },
    {
      name: USER_ROLES.PHARMACIST,
      description: ROLE_INFO.pharmacist.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.pharmacist),
    },
    {
      name: USER_ROLES.CASHIER,
      description: ROLE_INFO.cashier.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.cashier),
    },
    {
      name: USER_ROLES.RECEPTIONIST,
      description: ROLE_INFO.receptionist.description,
      permissions: JSON.stringify(ROLE_PERMISSIONS.receptionist),
    },
  ]

  for (const role of rolesToSeed) {
    // Check if role already exists
    const [existingRole] = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1)

    if (existingRole) {
      console.log(`  ✓ Role "${role.name}" already exists, updating...`)
      await db
        .update(roles)
        .set({
          description: role.description,
          permissions: role.permissions,
          updatedAt: new Date(),
        })
        .where(eq(roles.name, role.name))
    } else {
      console.log(`  + Creating role "${role.name}"...`)
      await db.insert(roles).values({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      })
    }
  }

  console.log("✅ Roles seeded successfully!")
}

/**
 * Get role ID by name
 */
export async function getRoleIdByName(roleName: string): Promise<number | null> {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1)

  return role?.id || null
}
