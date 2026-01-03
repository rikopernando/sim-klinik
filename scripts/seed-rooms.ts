/**
 * Rooms Seeder Script
 * Populates the rooms table with initial data for development/testing
 *
 * Usage:
 *   npx tsx scripts/seed-rooms.ts
 */

import { db } from "@/db"
import { rooms } from "@/db/schema/inpatient"
import { sql } from "drizzle-orm"

const ROOM_DATA = [
  // VIP Rooms
  {
    roomNumber: "VIP-101",
    roomType: "VIP",
    bedCount: 1,
    availableBeds: 1,
    floor: "1",
    building: "Gedung A",
    dailyRate: "1500000",
    facilities: "AC, TV LCD 42 inch, Kulkas, Sofa, Kamar Mandi Dalam, WiFi",
    description: "Kamar VIP dengan fasilitas lengkap dan pemandangan taman",
  },
  {
    roomNumber: "VIP-102",
    roomType: "VIP",
    bedCount: 1,
    availableBeds: 1,
    floor: "1",
    building: "Gedung A",
    dailyRate: "1500000",
    facilities: "AC, TV LCD 42 inch, Kulkas, Sofa, Kamar Mandi Dalam, WiFi",
    description: "Kamar VIP dengan fasilitas lengkap",
  },
  {
    roomNumber: "VIP-201",
    roomType: "VIP",
    bedCount: 1,
    availableBeds: 1,
    floor: "2",
    building: "Gedung A",
    dailyRate: "1500000",
    facilities: "AC, TV LCD 42 inch, Kulkas, Sofa, Kamar Mandi Dalam, WiFi",
    description: "Kamar VIP lantai 2 dengan view kota",
  },

  // Class 1 Rooms
  {
    roomNumber: "K1-103",
    roomType: "Class 1",
    bedCount: 2,
    availableBeds: 2,
    floor: "1",
    building: "Gedung A",
    dailyRate: "800000",
    facilities: "AC, TV, Kamar Mandi Dalam, WiFi",
    description: "Kamar kelas 1 dengan 2 bed",
  },
  {
    roomNumber: "K1-104",
    roomType: "Class 1",
    bedCount: 2,
    availableBeds: 2,
    floor: "1",
    building: "Gedung A",
    dailyRate: "800000",
    facilities: "AC, TV, Kamar Mandi Dalam, WiFi",
    description: "Kamar kelas 1 dengan 2 bed",
  },
  {
    roomNumber: "K1-202",
    roomType: "Class 1",
    bedCount: 2,
    availableBeds: 2,
    floor: "2",
    building: "Gedung A",
    dailyRate: "800000",
    facilities: "AC, TV, Kamar Mandi Dalam, WiFi",
    description: "Kamar kelas 1 lantai 2",
  },
  {
    roomNumber: "K1-203",
    roomType: "Class 1",
    bedCount: 2,
    availableBeds: 2,
    floor: "2",
    building: "Gedung A",
    dailyRate: "800000",
    facilities: "AC, TV, Kamar Mandi Dalam, WiFi",
    description: "Kamar kelas 1 lantai 2",
  },

  // Class 2 Rooms
  {
    roomNumber: "K2-105",
    roomType: "Class 2",
    bedCount: 4,
    availableBeds: 4,
    floor: "1",
    building: "Gedung B",
    dailyRate: "500000",
    facilities: "AC, TV, Kamar Mandi Bersama",
    description: "Kamar kelas 2 dengan 4 bed",
  },
  {
    roomNumber: "K2-106",
    roomType: "Class 2",
    bedCount: 4,
    availableBeds: 4,
    floor: "1",
    building: "Gedung B",
    dailyRate: "500000",
    facilities: "AC, TV, Kamar Mandi Bersama",
    description: "Kamar kelas 2 dengan 4 bed",
  },
  {
    roomNumber: "K2-204",
    roomType: "Class 2",
    bedCount: 4,
    availableBeds: 4,
    floor: "2",
    building: "Gedung B",
    dailyRate: "500000",
    facilities: "AC, TV, Kamar Mandi Bersama",
    description: "Kamar kelas 2 lantai 2",
  },
  {
    roomNumber: "K2-205",
    roomType: "Class 2",
    bedCount: 4,
    availableBeds: 4,
    floor: "2",
    building: "Gedung B",
    dailyRate: "500000",
    facilities: "AC, TV, Kamar Mandi Bersama",
    description: "Kamar kelas 2 lantai 2",
  },

  // Class 3 Rooms
  {
    roomNumber: "K3-107",
    roomType: "Class 3",
    bedCount: 6,
    availableBeds: 6,
    floor: "1",
    building: "Gedung B",
    dailyRate: "300000",
    facilities: "Kipas Angin, Kamar Mandi Bersama",
    description: "Kamar kelas 3 dengan 6 bed",
  },
  {
    roomNumber: "K3-108",
    roomType: "Class 3",
    bedCount: 6,
    availableBeds: 6,
    floor: "1",
    building: "Gedung B",
    dailyRate: "300000",
    facilities: "Kipas Angin, Kamar Mandi Bersama",
    description: "Kamar kelas 3 dengan 6 bed",
  },
  {
    roomNumber: "K3-206",
    roomType: "Class 3",
    bedCount: 6,
    availableBeds: 6,
    floor: "2",
    building: "Gedung B",
    dailyRate: "300000",
    facilities: "Kipas Angin, Kamar Mandi Bersama",
    description: "Kamar kelas 3 lantai 2",
  },

  // ICU Rooms
  {
    roomNumber: "ICU-301",
    roomType: "ICU",
    bedCount: 1,
    availableBeds: 1,
    floor: "3",
    building: "Gedung A",
    dailyRate: "2500000",
    facilities: "Ventilator, Monitor Jantung, AC, Peralatan Medis Lengkap, Nurse Station 24/7",
    description: "Intensive Care Unit dengan peralatan lengkap",
  },
  {
    roomNumber: "ICU-302",
    roomType: "ICU",
    bedCount: 1,
    availableBeds: 1,
    floor: "3",
    building: "Gedung A",
    dailyRate: "2500000",
    facilities: "Ventilator, Monitor Jantung, AC, Peralatan Medis Lengkap, Nurse Station 24/7",
    description: "Intensive Care Unit dengan peralatan lengkap",
  },
  {
    roomNumber: "ICU-303",
    roomType: "ICU",
    bedCount: 1,
    availableBeds: 1,
    floor: "3",
    building: "Gedung A",
    dailyRate: "2500000",
    facilities: "Ventilator, Monitor Jantung, AC, Peralatan Medis Lengkap, Nurse Station 24/7",
    description: "Intensive Care Unit dengan peralatan lengkap",
  },
  {
    roomNumber: "ICU-304",
    roomType: "ICU",
    bedCount: 1,
    availableBeds: 1,
    floor: "3",
    building: "Gedung A",
    dailyRate: "2500000",
    facilities: "Ventilator, Monitor Jantung, AC, Peralatan Medis Lengkap, Nurse Station 24/7",
    description: "Intensive Care Unit dengan peralatan lengkap",
  },

  // Isolation Rooms
  {
    roomNumber: "ISO-401",
    roomType: "Isolation",
    bedCount: 1,
    availableBeds: 1,
    floor: "4",
    building: "Gedung C",
    dailyRate: "1000000",
    facilities: "AC dengan Filter HEPA, Tekanan Negatif, Kamar Mandi Dalam, Airlock Entrance",
    description: "Ruang isolasi untuk penyakit menular",
  },
  {
    roomNumber: "ISO-402",
    roomType: "Isolation",
    bedCount: 1,
    availableBeds: 1,
    floor: "4",
    building: "Gedung C",
    dailyRate: "1000000",
    facilities: "AC dengan Filter HEPA, Tekanan Negatif, Kamar Mandi Dalam, Airlock Entrance",
    description: "Ruang isolasi untuk penyakit menular",
  },
  {
    roomNumber: "ISO-403",
    roomType: "Isolation",
    bedCount: 1,
    availableBeds: 1,
    floor: "4",
    building: "Gedung C",
    dailyRate: "1000000",
    facilities: "AC dengan Filter HEPA, Tekanan Negatif, Kamar Mandi Dalam, Airlock Entrance",
    description: "Ruang isolasi untuk penyakit menular",
  },
]

async function seedRooms() {
  try {
    console.log("🌱 Starting rooms seeder...")

    // Check if rooms already exist
    const existingRooms = await db.select().from(rooms)

    if (existingRooms.length > 0) {
      console.log(`⚠️  Found ${existingRooms.length} existing rooms in database`)
      console.log("Do you want to:")
      console.log("1. Skip seeding (keep existing data)")
      console.log("2. Clear and re-seed (WARNING: will delete all rooms)")
      console.log("\nTo clear and re-seed, run: npx tsx scripts/seed-rooms.ts --force")
      console.log("Otherwise, exiting...")
      return
    }

    // Insert rooms
    console.log(`📦 Inserting ${ROOM_DATA.length} rooms...`)

    for (const roomData of ROOM_DATA) {
      await db.insert(rooms).values({
        ...roomData,
        status: "available",
        isActive: "active",
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
    }

    console.log("✅ Successfully seeded rooms!")
    console.log("\nRoom Summary:")
    console.log(`- VIP: 3 rooms (3 beds total)`)
    console.log(`- Class 1: 4 rooms (8 beds total)`)
    console.log(`- Class 2: 4 rooms (16 beds total)`)
    console.log(`- Class 3: 3 rooms (18 beds total)`)
    console.log(`- ICU: 4 rooms (4 beds total)`)
    console.log(`- Isolation: 3 rooms (3 beds total)`)
    console.log(`\nTotal: ${ROOM_DATA.length} rooms with 52 beds`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding rooms:", error)
    process.exit(1)
  }
}

async function clearAndSeedRooms() {
  try {
    console.log("🗑️  Clearing existing rooms...")
    await db.delete(rooms)

    console.log("🌱 Re-seeding rooms...")

    for (const roomData of ROOM_DATA) {
      await db.insert(rooms).values({
        ...roomData,
        status: "available",
        isActive: "active",
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
    }

    console.log("✅ Successfully cleared and re-seeded rooms!")
    console.log(`\nTotal: ${ROOM_DATA.length} rooms with 52 beds`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error clearing and seeding rooms:", error)
    process.exit(1)
  }
}

// Check for --force flag
const args = process.argv.slice(2)
if (args.includes("--force")) {
  clearAndSeedRooms()
} else {
  seedRooms()
}
