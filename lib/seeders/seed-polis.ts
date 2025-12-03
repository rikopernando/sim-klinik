/**
 * Database Seeder for Polis (Poliklinik/Departments)
 * Seeds default polis/departments into the database
 */

import { db } from "@/db"
import { polis } from "@/db/schema/visits"
import { eq } from "drizzle-orm"

/**
 * Seed all default polis/departments
 */
export async function seedPolis() {
  console.log("🌱 Seeding polis (poliklinik)...")

  const polisToSeed = [
    {
      name: "Poli Umum",
      code: "PU",
      description: "Poliklinik Umum - Pelayanan kesehatan umum untuk berbagai keluhan",
      isActive: "active",
    },
    {
      name: "Poli Gigi",
      code: "PG",
      description: "Poliklinik Gigi - Pelayanan kesehatan gigi dan mulut",
      isActive: "active",
    },
    {
      name: "Poli Anak",
      code: "PA",
      description: "Poliklinik Anak - Pelayanan kesehatan khusus anak-anak",
      isActive: "active",
    },
    {
      name: "Poli Kebidanan",
      code: "PKB",
      description: "Poliklinik Kebidanan - Pelayanan kesehatan ibu dan kandungan",
      isActive: "active",
    },
    {
      name: "Poli Penyakit Dalam",
      code: "PPD",
      description: "Poliklinik Penyakit Dalam - Pelayanan kesehatan penyakit dalam",
      isActive: "active",
    },
    {
      name: "Poli Bedah",
      code: "PB",
      description: "Poliklinik Bedah - Pelayanan kesehatan bedah",
      isActive: "active",
    },
    {
      name: "Poli Mata",
      code: "PM",
      description: "Poliklinik Mata - Pelayanan kesehatan mata",
      isActive: "active",
    },
    {
      name: "Poli THT",
      code: "PTHT",
      description: "Poliklinik THT - Pelayanan kesehatan telinga, hidung, dan tenggorokan",
      isActive: "active",
    },
    {
      name: "Poli Kulit & Kelamin",
      code: "PKK",
      description: "Poliklinik Kulit & Kelamin - Pelayanan kesehatan kulit dan kelamin",
      isActive: "active",
    },
    {
      name: "Poli Saraf",
      code: "PS",
      description: "Poliklinik Saraf - Pelayanan kesehatan saraf",
      isActive: "active",
    },
  ]

  for (const poliData of polisToSeed) {
    // Check if poli already exists by code
    const [existingPoli] = await db
      .select()
      .from(polis)
      .where(eq(polis.code, poliData.code))
      .limit(1)

    if (existingPoli) {
      console.log(`  ✓ Poli "${poliData.name}" (${poliData.code}) already exists, updating...`)
      await db
        .update(polis)
        .set({
          name: poliData.name,
          description: poliData.description,
          isActive: poliData.isActive,
        })
        .where(eq(polis.code, poliData.code))
    } else {
      console.log(`  + Creating poli "${poliData.name}" (${poliData.code})...`)
      await db.insert(polis).values({
        name: poliData.name,
        code: poliData.code,
        description: poliData.description,
        isActive: poliData.isActive,
      })
    }
  }

  console.log("✅ Polis seeded successfully!")
}

/**
 * Get poli ID by code
 */
export async function getPoliIdByCode(code: string): Promise<number | null> {
  const [poli] = await db.select().from(polis).where(eq(polis.code, code)).limit(1)

  return poli?.id || null
}
